#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, serialize } from "parse5";

import { parseArgs } from "./lib/cli-args.mjs";
import {
  HtmlCheckError,
  checkHtml5Block,
  expectedCsp,
} from "./lib/html-check.mjs";
import {
  buildHtml5Manifest,
  discoverDependencies,
} from "./lib/html5-manifest.mjs";
import { validateVisualizationSpec } from "./lib/visualization-spec.mjs";

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const RESERVED_META_NAMES = new Set([
  "charset",
  "viewport",
  "use-iframe",
  "html-box-height-mode",
  "description",
]);
const HEIGHT_MODES = new Set(["auto", "viewport"]);

export class HtmlBuildError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "HtmlBuildError";
    this.code = code;
  }
}

function children(node) {
  return node?.childNodes ?? [];
}

function metaAttributes(node) {
  return new Map(
    (node.attrs ?? []).map(({ name, value }) => [name.toLowerCase(), value]),
  );
}

function isReservedMeta(node) {
  if (node.tagName !== "meta") return false;
  const attributes = metaAttributes(node);
  return (
    attributes.has("charset") ||
    RESERVED_META_NAMES.has(attributes.get("name")?.toLowerCase() ?? "") ||
    attributes.get("http-equiv")?.toLowerCase() === "content-security-policy"
  );
}

function reservedMetaDescription(node) {
  const attributes = metaAttributes(node);
  const label =
    attributes.get("name") ??
    attributes.get("http-equiv") ??
    attributes.get("charset") ??
    "meta";
  return `<meta ${label}>`;
}

function metaNode(attributes) {
  return {
    nodeName: "meta",
    tagName: "meta",
    attrs: attributes.map(([name, value]) => ({ name, value })),
    namespaceURI: HTML_NAMESPACE,
    childNodes: [],
    parentNode: null,
  };
}

function textNode(value, parent) {
  return { nodeName: "#text", value: String(value), parentNode: parent };
}

export async function buildHtml5Page({
  sourceHtml,
  spec,
  heightMode = "auto",
  maxBytes = 500_000,
}) {
  if (typeof sourceHtml !== "string" || !sourceHtml.trim()) {
    throw new HtmlBuildError("invalid-source", "source HTML is required");
  }
  if (!HEIGHT_MODES.has(heightMode)) {
    throw new HtmlBuildError(
      "invalid-height-mode",
      "heightMode must be auto or viewport",
    );
  }
  const specReport = validateVisualizationSpec(spec);
  if (!specReport.ok) {
    throw new HtmlBuildError(
      "invalid-visualization-spec",
      specReport.violations.map((item) => item.code).join(","),
    );
  }

  const document = parse(sourceHtml);
  const doctypes = children(document).filter(
    (node) => node.nodeName === "#documentType",
  );
  const roots = children(document).filter((node) => node.tagName === "html");
  const root = roots[0];
  const head = children(root).find((node) => node.tagName === "head");
  const body = children(root).find((node) => node.tagName === "body");
  if (
    doctypes.length !== 1 ||
    roots.length !== 1 ||
    !head ||
    !body
  ) {
    throw new HtmlBuildError(
      "invalid-source",
      "source must be one explicit complete HTML document with doctype, head, and body",
    );
  }

  const reserved = children(head).filter(isReservedMeta);
  if (reserved.length > 0) {
    throw new HtmlBuildError(
      "reserved-metadata",
      `source page must not declare reserved HTML5 Block metadata: ${reserved
        .map(reservedMetaDescription)
        .join(", ")}`,
    );
  }

  const existingTitle = children(head).find((node) => node.tagName === "title");
  if (existingTitle) {
    existingTitle.childNodes = [textNode(spec.title, existingTitle)];
  } else {
    const titleNode = {
      nodeName: "title",
      tagName: "title",
      attrs: [],
      namespaceURI: HTML_NAMESPACE,
      childNodes: [],
      parentNode: head,
    };
    titleNode.childNodes = [textNode(spec.title, titleNode)];
    head.childNodes.push(titleNode);
  }

  let dependencies;
  try {
    dependencies = discoverDependencies(sourceHtml, spec.type);
  } catch (error) {
    throw new HtmlBuildError(
      error.code ?? "dependency-policy",
      error.message,
    );
  }
  const csp = expectedCsp(dependencies);
  const requiredMetas = [
    ["charset", "utf-8"],
    ["name", "viewport", "width=device-width, initial-scale=1"],
    ["name", "use-iframe", "true"],
    ["name", "html-box-height-mode", heightMode],
    ["name", "description", spec.summary],
    ["http-equiv", "Content-Security-Policy", csp],
  ].map(([kind, nameOrValue, value]) =>
    kind === "charset"
      ? metaNode([["charset", nameOrValue]])
      : metaNode([[kind, nameOrValue], ["content", value]]),
  );
  for (const meta of requiredMetas) {
    meta.parentNode = head;
    head.childNodes.push(meta);
  }

  const html = serialize(document);
  let manifest;
  try {
    manifest = await buildHtml5Manifest({ html, spec, heightMode });
  } catch (error) {
    throw new HtmlBuildError(error.code ?? "manifest", error.message);
  }

  let checks;
  try {
    checks = checkHtml5Block(html, { manifest, maxBytes });
  } catch (error) {
    if (error instanceof HtmlCheckError) {
      throw new HtmlBuildError(
        "html-check",
        JSON.stringify(error.violations),
      );
    }
    throw error;
  }

  return {
    html,
    manifest,
    bytes: Buffer.byteLength(html, "utf8"),
    sha256: createHash("sha256").update(html, "utf8").digest("hex"),
    checks: {
      ok: true,
      svgCount: checks.svgCount,
      scriptCount: checks.scriptCount,
      normalizedContentSha256: checks.normalizedContentSha256,
    },
  };
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv, {
    allowed: new Set([
      "spec",
      "input",
      "output-dir",
      "height-mode",
      "max-bytes",
    ]),
    required: ["spec", "input", "output-dir"],
  });
  const spec = JSON.parse(await readFile(resolve(options.spec), "utf8"));
  const sourceHtml = await readFile(resolve(options.input), "utf8");
  const result = await buildHtml5Page({
    sourceHtml,
    spec,
    heightMode: options["height-mode"] ?? "auto",
    maxBytes: options["max-bytes"] ? Number(options["max-bytes"]) : 500_000,
  });
  const outputDir = resolve(options["output-dir"]);
  const outputs = [
    ["index.html", result.html],
    ["visualization.spec.json", `${JSON.stringify(spec, null, 2)}\n`],
    [
      "visualization.manifest.json",
      `${JSON.stringify(result.manifest, null, 2)}\n`,
    ],
  ];
  for (const [name, content] of outputs) {
    const path = join(outputDir, name);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, "utf8");
  }
  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        outputDir,
        files: outputs.map(([name]) => basename(name)),
        bytes: result.bytes,
        sha256: result.sha256,
        type: result.manifest.type,
        heightMode: result.manifest.heightMode,
      },
      null,
      2,
    )}\n`,
  );
}

const isDirect =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isDirect) {
  main().catch((error) => {
    process.stderr.write(
      `${JSON.stringify(
        {
          ok: false,
          error: error.message,
          ...(error.code ? { code: error.code } : {}),
        },
        null,
        2,
      )}\n`,
    );
    process.exitCode = 1;
  });
}
