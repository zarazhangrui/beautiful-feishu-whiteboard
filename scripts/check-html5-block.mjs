#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

import { HtmlCheckError, checkHtml5Block } from "./lib/html-check.mjs";
import { canonicalizeSvg } from "./lib/svg-canonical.mjs";

function usage() {
  return "Usage: node scripts/check-html5-block.mjs --input widget.html [--max-bytes 500000] [--source-svg diagram.svg | --source-sha256 HASH]";
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) throw new Error(`unexpected argument: ${arg}`);
    const key = arg.slice(2);
    if (!["input", "max-bytes", "source-svg", "source-sha256"].includes(key)) {
      throw new Error(`unknown option: ${arg}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${arg} requires a value`);
    options[key] = value;
    index += 1;
  }
  if (!options.input) throw new Error("--input is required");
  if (options["source-svg"] && options["source-sha256"]) {
    throw new Error("use only one of --source-svg or --source-sha256");
  }
  return options;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const html = await readFile(options.input, "utf8");
  const sourceSvg = options["source-svg"]
    ? await readFile(options["source-svg"], "utf8")
    : null;
  const expectedSourceSvgSha256 = sourceSvg
    ? createHash("sha256").update(sourceSvg).digest("hex")
    : options["source-sha256"];
  const expectedSourceSvgCanonicalSha256 = sourceSvg
    ? createHash("sha256").update(canonicalizeSvg(sourceSvg)).digest("hex")
    : undefined;
  const report = checkHtml5Block(html, {
    maxBytes: options["max-bytes"] ? Number(options["max-bytes"]) : undefined,
    expectedSourceSvgSha256,
    expectedSourceSvgCanonicalSha256,
  });
  console.log(JSON.stringify({ input: options.input, ...report }, null, 2));
} catch (error) {
  const payload =
    error instanceof HtmlCheckError
      ? { ok: false, violations: error.violations }
      : { ok: false, error: error.message, usage: usage() };
  console.error(JSON.stringify(payload, null, 2));
  process.exitCode = 1;
}
