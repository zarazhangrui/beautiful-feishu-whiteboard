#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { parseArgs } from "./lib/cli-args.mjs";
import {
  extractReferenceEntry,
  verifyFetchedHtml5Block,
} from "./lib/html5-fetch-verify.mjs";
import { HtmlCheckError } from "./lib/html-check.mjs";
import { verifyHtml5Artifact } from "./lib/html5-verify-artifact.mjs";

const execFileAsync = promisify(execFile);

function publishError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildDocxXml({ title, whiteboardSvgPath, htmlPath }) {
  const parts = [`<title>${escapeXml(title)}</title>`];
  if (whiteboardSvgPath) {
    parts.push(
      `<whiteboard type="svg" path="${escapeXml(whiteboardSvgPath)}"></whiteboard>`,
    );
  }
  parts.push(`<html5-block path="${escapeXml(htmlPath)}"/>`);
  return `${parts.join("\n")}\n`;
}

export function deepFind(payload, keys) {
  const wanted = new Set(keys.map((key) => key.toLowerCase().replaceAll("_", "")));
  const stack = [payload];
  const seen = new WeakSet();
  while (stack.length) {
    const value = stack.shift();
    if (!value || typeof value !== "object") continue;
    if (seen.has(value)) continue;
    seen.add(value);
    if (Array.isArray(value)) {
      for (const item of value) stack.push(item);
      continue;
    }
    for (const [key, child] of Object.entries(value)) {
      const normalized = key.toLowerCase().replaceAll("_", "");
      if (wanted.has(normalized) && typeof child === "string" && child.trim()) {
        return child;
      }
      stack.push(child);
    }
  }
  return null;
}

export function extractDocumentToken(payload) {
  return deepFind(payload, [
    "token",
    "documentToken",
    "documentId",
    "docId",
    "url",
  ]);
}

export function extractBlockId(payload) {
  return deepFind(payload, ["blockId", "block_id", "blockToken"]);
}

export function extractRevision(payload) {
  if (typeof payload.revision === "number") return payload.revision;
  if (typeof payload.revision_id === "number") return payload.revision_id;
  if (typeof payload.data?.document?.revision_id === "number") {
    return payload.data.document.revision_id;
  }
  if (typeof payload.data?.revision === "number") return payload.data.revision;
  return null;
}

function parseCliJson(stdout, command) {
  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(
      `lark-cli ${command} returned non-JSON output (${error.message}); stdout: ${String(
        stdout,
      ).slice(0, 500)}`,
    );
  }
}

export async function publishHtml5Block({
  spec,
  manifest,
  html,
  outputDir,
  title = spec.title,
  whiteboardSvgPath,
  whiteboardSvgFile,
  htmlPath = "@./index.html",
  runLarkCli,
  larkCli = "lark-cli",
  asUser = "user",
}) {
  verifyHtml5Artifact({ spec, manifest, html });
  if (manifest.validation?.status !== "passed") {
    throw publishError(
      "unvalidated-manifest",
      "unvalidated-manifest: run scripts/check-html5-block.mjs and scripts/render-html5-block.mjs first; the Manifest must record passed validation",
    );
  }

  await mkdir(outputDir, { recursive: true });
  const stagedHtmlName = basename(String(htmlPath).replace(/^@\//, ""));
  await writeFile(join(outputDir, stagedHtmlName), html, "utf8");
  if (whiteboardSvgPath && whiteboardSvgFile) {
    const stagedSvgName = basename(String(whiteboardSvgPath).replace(/^@\//, ""));
    await writeFile(
      join(outputDir, stagedSvgName),
      await readFile(whiteboardSvgFile, "utf8"),
      "utf8",
    );
  }
  const documentXml = buildDocxXml({ title, whiteboardSvgPath, htmlPath });
  const xmlPath = join(outputDir, "document.xml");
  await writeFile(xmlPath, documentXml, "utf8");

  const runner =
    runLarkCli ??
    (async (args, options) => {
      const { stdout } = await execFileAsync(larkCli, args, {
        encoding: "utf8",
        ...options,
      });
      return stdout;
    });

  const createStdout = await runner(
    ["docs", "+create", "--doc-format", "xml", "--content", "@./document.xml", "--as", asUser],
    { cwd: outputDir },
  );
  const createPayload = parseCliJson(createStdout, "docs +create");
  const documentToken = extractDocumentToken(createPayload);
  if (!documentToken) {
    throw publishError(
      "no-document-token",
      `no-document-token: create response contained no document token: ${createStdout.slice(0, 500)}`,
    );
  }
  const documentUrl = deepFind(createPayload, ["url"]);

  let fetchPayload;
  try {
    const fetchStdout = await runner(
      ["docs", "+fetch", "--doc", documentToken, "--detail", "full", "--as", asUser],
      { cwd: outputDir },
    );
    fetchPayload = parseCliJson(fetchStdout, "docs +fetch");
    const fetchPath = join(outputDir, "fetch-response.json");
    await writeFile(fetchPath, `${JSON.stringify(fetchPayload, null, 2)}\n`, "utf8");
  } catch (error) {
    error.documentToken = documentToken;
    error.documentUrl = documentUrl;
    throw error;
  }

  const warnings = Array.isArray(fetchPayload.warnings)
    ? fetchPayload.warnings
    : Array.isArray(fetchPayload.data?.warnings)
      ? fetchPayload.data.warnings
      : [];
  const tips = Array.isArray(fetchPayload.tips)
    ? fetchPayload.tips
    : Array.isArray(fetchPayload.data?.tips)
      ? fetchPayload.data.tips
      : [];
  let verification = verifyFetchedHtml5Block({
    fetchedDocument: fetchPayload,
    localHtml: html,
    warnings,
    tips,
  });
  if (
    !verification.ok &&
    verification.dataRef &&
    verification.violations.some(
      (item) => item.code === "remote-html-path",
    )
  ) {
    const entry = extractReferenceEntry(fetchPayload, verification.dataRef);
    if (entry?.path) {
      const relativePath = String(entry.path).replace(/^@/, "");
      try {
        const exportedHtml = await readFile(
          resolve(outputDir, relativePath),
          "utf8",
        );
        const resolved = verifyFetchedHtml5Block({
          fetchedDocument: fetchPayload,
          localHtml: html,
          remoteHtml: exportedHtml,
          warnings,
          tips,
        });
        if (resolved.ok) verification = resolved;
      } catch (error) {
        verification = {
          ...verification,
          violations: [
            ...verification.violations,
            {
              code: "remote-html-read-failed",
              message: `cannot read exported HTML ${entry.path}: ${error.message}`,
            },
          ],
        };
      }
    }
  }

  return {
    ok: verification.ok,
    documentToken,
    documentUrl,
    blockId: verification.blockId ?? extractBlockId(fetchPayload),
    revision: extractRevision(fetchPayload),
    localSha256: verification.localSha256,
    remoteSha256: verification.remoteSha256,
    warnings: verification.warnings,
    tips: verification.tips,
    violations: verification.violations,
    verification,
    files: [xmlPath, join(outputDir, "fetch-response.json")],
  };
}

async function run() {
  const options = parseArgs(process.argv.slice(2), {
    allowed: new Set([
      "spec",
      "manifest",
      "input",
      "output-dir",
      "title",
      "whiteboard-svg",
      "whiteboard-svg-file",
      "lark-cli",
      "as",
    ]),
    required: ["spec", "manifest", "input", "output-dir"],
  });
  const spec = JSON.parse(await readFile(options.spec, "utf8"));
  const manifest = JSON.parse(await readFile(options.manifest, "utf8"));
  const html = await readFile(options.input, "utf8");
  const report = await publishHtml5Block({
    spec,
    manifest,
    html,
    outputDir: options["output-dir"],
    title: options.title,
    whiteboardSvgPath: options["whiteboard-svg"],
    whiteboardSvgFile: options["whiteboard-svg-file"],
    larkCli: options["lark-cli"],
    asUser: options.as,
  });
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}

const isDirect =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isDirect) {
  run().catch((error) => {
    const payload =
      error instanceof HtmlCheckError
        ? { ok: false, violations: error.violations }
        : {
            ok: false,
            error: error.message,
            ...(error.code ? { code: error.code } : {}),
            ...(error.documentToken
              ? { documentToken: error.documentToken, documentUrl: error.documentUrl }
              : {}),
          };
    console.error(JSON.stringify(payload, null, 2));
    process.exitCode = 1;
  });
}
