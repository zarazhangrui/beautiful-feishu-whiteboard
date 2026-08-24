#!/usr/bin/env node
import { renderHtmlFile } from "./lib/browser-render.mjs";

function parseArgs(argv) {
  const options = {};
  const allowed = new Set([
    "input",
    "output-dir",
    "widths",
    "narrow-width",
    "min-supported-width",
    "chrome-path",
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) throw new Error(`unexpected argument: ${key}`);
    if (!allowed.has(key.slice(2))) throw new Error(`unknown option: ${key}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${key} requires a value`);
    options[key.slice(2)] = value;
    index += 1;
  }
  if (!options.input || !options["output-dir"]) {
    throw new Error("--input and --output-dir are required");
  }
  return options;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const report = await renderHtmlFile({
    input: options.input,
    outputDir: options["output-dir"],
    widths: options.widths ?? "720,820,1000",
    narrowWidth: options["narrow-width"] ?? 600,
    minSupportedWidth: options["min-supported-width"],
    chromePath: options["chrome-path"],
  });
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exitCode = 1;
}
