#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { verifyFetchedHtml5Block } from "./lib/html5-fetch-verify.mjs";
import { HtmlCheckError, checkHtml5Block } from "./lib/html-check.mjs";
import { verifyManifest } from "./lib/html5-manifest.mjs";
import { validateVisualizationSpec } from "./lib/visualization-spec.mjs";

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

export async function publishHtml5Block({
  spec,
  manifest,
  html,
  outputDir,
  title = spec.title,
  whiteboardSvgPath,
  htmlPath = "@./index.html",
  runLarkCli,
  larkCli = "lark-cli",
  asUser = "user",
}) {
  const specReport = validateVisualizationSpec(spec);
  if (!specReport.ok) {
    throw publishError(
      "invalid-visualization-spec",
      `invalid-visualization-spec: ${specReport.violations
        .map((item) => item.code)
        .join(",")}`,
    );
  }
  verifyManifest({ html, spec, manifest });
  if (manifest.validation?.status !== "passed") {
    throw publishError(
      "unvalidated-manifest",
      "unvalidated-manifest: run scripts/check-html5-block.mjs and scripts/render-html5-block.mjs first; the Manifest must record passed validation",
    );
  }
  checkHtml5Block(html, { manifest });

  await mkdir(outputDir, { recursive: true });
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
  const createPayload = JSON.parse(createStdout);
  const documentToken = extractDocumentToken(createPayload);
  if (!documentToken) {
    throw publishError(
      "no-document-token",
      `no-document-token: create response contained no document token: ${createStdout.slice(0, 500)}`,
    );
  }
  const documentUrl = deepFind(createPayload, ["url"]);

  const fetchStdout = await runner(
    ["docs", "+fetch", "--doc", documentToken, "--detail", "full", "--as", asUser],
    { cwd: outputDir },
  );
  const fetchPayload = JSON.parse(fetchStdout);
  const fetchPath = join(outputDir, "fetch-response.json");
  await writeFile(fetchPath, `${JSON.stringify(fetchPayload, null, 2)}\n`, "utf8");

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
  const verification = verifyFetchedHtml5Block({
    fetchedDocument: fetchPayload,
    localHtml: html,
    warnings,
    tips,
  });
  const revision =
    typeof fetchPayload.revision === "number"
      ? fetchPayload.revision
      : typeof fetchPayload.data?.revision === "number"
        ? fetchPayload.data.revision
        : null;

  return {
    ok: verification.ok,
    documentToken,
    documentUrl,
    blockId: verification.blockId ?? extractBlockId(fetchPayload),
    revision,
    localSha256: verification.localSha256,
    remoteSha256: verification.remoteSha256,
    warnings: verification.warnings,
    tips: verification.tips,
    violations: verification.violations,
    verification,
    files: [xmlPath, fetchPath],
  };
}

function parseArgs(argv) {
  const options = {};
  const allowed = new Set([
    "spec",
    "manifest",
    "input",
    "output-dir",
    "title",
    "whiteboard-svg",
    "lark-cli",
    "as",
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) {
      throw new Error(`unexpected argument: ${argument}`);
    }
    const key = argument.slice(2);
    if (!allowed.has(key)) throw new Error(`unknown option: ${argument}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`missing value for ${argument}`);
    }
    options[key] = value;
    index += 1;
  }
  for (const required of ["spec", "manifest", "input", "output-dir"]) {
    if (!options[required]) throw new Error(`--${required} is required`);
  }
  return options;
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
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
          };
    console.error(JSON.stringify(payload, null, 2));
    process.exitCode = 1;
  });
}
