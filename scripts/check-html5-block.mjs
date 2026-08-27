#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { HtmlCheckError, checkHtml5Block } from "./lib/html-check.mjs";
import { verifyManifest } from "./lib/html5-manifest.mjs";
import { validateVisualizationSpec } from "./lib/visualization-spec.mjs";

function usage() {
  return "Usage: node scripts/check-html5-block.mjs --spec visualization.spec.json --manifest visualization.manifest.json --input index.html [--max-bytes 500000]";
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) throw new Error(`unexpected argument: ${arg}`);
    const key = arg.slice(2);
    if (!["spec", "manifest", "input", "max-bytes"].includes(key)) {
      throw new Error(`unknown option: ${arg}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${arg} requires a value`);
    options[key] = value;
    index += 1;
  }
  for (const required of ["spec", "manifest", "input"]) {
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
  const report = checkHtml5Block(html, {
    manifest,
    maxBytes: options["max-bytes"] ? Number(options["max-bytes"]) : undefined,
  });
  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        input: options.input,
        protocolVersion: manifest.protocolVersion,
        type: manifest.type,
        heightMode: manifest.heightMode,
        dependencies: manifest.dependencies.map((item) => item.id),
        interactions: manifest.interactions,
        bytes: report.bytes,
        sha256: createHash("sha256").update(html, "utf8").digest("hex"),
        normalizedContentSha256: report.normalizedContentSha256,
        svgCount: report.svgCount,
        scriptCount: report.scriptCount,
        violations: [],
      },
      null,
      2,
    )}\n`,
  );
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
