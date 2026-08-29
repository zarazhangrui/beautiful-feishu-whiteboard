#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { parseArgs } from "./lib/cli-args.mjs";
import { HtmlCheckError } from "./lib/html-check.mjs";
import { verifyHtml5Artifact } from "./lib/html5-verify-artifact.mjs";

function usage() {
  return "Usage: node scripts/check-html5-block.mjs --spec visualization.spec.json --manifest visualization.manifest.json --input index.html [--max-bytes 500000]";
}

async function run() {
  const options = parseArgs(process.argv.slice(2), {
    allowed: new Set(["spec", "manifest", "input", "max-bytes"]),
    required: ["spec", "manifest", "input"],
  });
  const spec = JSON.parse(await readFile(options.spec, "utf8"));
  const manifest = JSON.parse(await readFile(options.manifest, "utf8"));
  const html = await readFile(options.input, "utf8");

  const report = verifyHtml5Artifact({
    spec,
    manifest,
    html,
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
