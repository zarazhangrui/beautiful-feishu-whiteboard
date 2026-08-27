#!/usr/bin/env node
import { readFile } from "node:fs/promises";

import { renderHtmlFile } from "./lib/browser-render.mjs";
import { HtmlCheckError, checkHtml5Block } from "./lib/html-check.mjs";
import { verifyManifest } from "./lib/html5-manifest.mjs";
import { validateVisualizationSpec } from "./lib/visualization-spec.mjs";

function usage() {
  return "Usage: node scripts/render-html5-block.mjs --spec visualization.spec.json --manifest visualization.manifest.json --input index.html --output-dir render [--widths 390,820,1440] [--chrome-path PATH]";
}

function parseArgs(argv) {
  const options = {};
  const allowed = new Set([
    "spec",
    "manifest",
    "input",
    "output-dir",
    "widths",
    "chrome-path",
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

  const specReport = validateVisualizationSpec(spec);
  if (!specReport.ok) {
    throw new Error(
      `invalid-visualization-spec: ${specReport.violations
        .map((item) => item.code)
        .join(",")}`,
    );
  }
  verifyManifest({ html, spec, manifest });
  checkHtml5Block(html, { manifest });

  const report = await renderHtmlFile({
    input: options.input,
    outputDir: options["output-dir"],
    widths: options.widths ?? "390,820,1440",
    chromePath: options["chrome-path"],
    dependencies: manifest.dependencies,
    interactions: manifest.interactions,
  });
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}

run().catch((error) => {
  const payload =
    error instanceof HtmlCheckError
      ? { ok: false, violations: error.violations }
      : {
          ok: false,
          error: error.message,
          ...(error.code ? { code: error.code } : {}),
          usage: usage(),
        };
  console.error(JSON.stringify(payload, null, 2));
  process.exitCode = 1;
});
