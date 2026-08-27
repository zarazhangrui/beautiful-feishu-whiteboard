#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { renderHtmlFile } from "./lib/browser-render.mjs";
import { parseArgs } from "./lib/cli-args.mjs";
import { HtmlCheckError } from "./lib/html-check.mjs";
import { markHtml5ValidationPassed } from "./lib/html5-manifest.mjs";
import { verifyHtml5Artifact } from "./lib/html5-verify-artifact.mjs";

function usage() {
  return "Usage: node scripts/render-html5-block.mjs --spec visualization.spec.json --manifest visualization.manifest.json --input index.html --output-dir render [--widths 390,820,1440] [--chrome-path PATH]";
}

async function run() {
  const options = parseArgs(process.argv.slice(2), {
    allowed: new Set([
      "spec",
      "manifest",
      "input",
      "output-dir",
      "widths",
      "chrome-path",
    ]),
    required: ["spec", "manifest", "input", "output-dir"],
  });
  const spec = JSON.parse(await readFile(options.spec, "utf8"));
  const manifest = JSON.parse(await readFile(options.manifest, "utf8"));
  const html = await readFile(options.input, "utf8");

  verifyHtml5Artifact({ spec, manifest, html });

  const report = await renderHtmlFile({
    input: options.input,
    outputDir: options["output-dir"],
    widths: options.widths ?? "390,820,1440",
    chromePath: options["chrome-path"],
    dependencies: manifest.dependencies,
    interactions: manifest.interactions,
  });
  if (report.ok) {
    const manifestPath = resolve(options.manifest);
    const passedManifest = markHtml5ValidationPassed({
      html,
      spec,
      manifest,
      checks: [
        "static-check",
        ...report.widths.map((width) => `browser-${width}`),
        "interactions",
        "reduced-motion",
        ...(report.offlineFallback?.skipped
          ? []
          : ["offline-fallback"]),
      ],
    });
    await writeFile(
      manifestPath,
      `${JSON.stringify(passedManifest, null, 2)}\n`,
      "utf8",
    );
    report.manifestPath = manifestPath;
  }
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
