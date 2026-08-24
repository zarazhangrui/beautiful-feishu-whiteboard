#!/usr/bin/env node
import { readFile } from "node:fs/promises";

import { HtmlCheckError, checkHtml5Block } from "./lib/html-check.mjs";

function usage() {
  return "Usage: node scripts/check-html5-block.mjs --input widget.html [--max-bytes 500000] [--source-sha256 HASH]";
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) throw new Error(`unexpected argument: ${arg}`);
    const key = arg.slice(2);
    if (!["input", "max-bytes", "source-sha256"].includes(key)) {
      throw new Error(`unknown option: ${arg}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${arg} requires a value`);
    options[key] = value;
    index += 1;
  }
  if (!options.input) throw new Error("--input is required");
  return options;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const html = await readFile(options.input, "utf8");
  const report = checkHtml5Block(html, {
    maxBytes: options["max-bytes"] ? Number(options["max-bytes"]) : undefined,
    expectedSourceSvgSha256: options["source-sha256"],
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
