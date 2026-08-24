#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import {
  link,
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildHtmlDocument } from "./lib/html-wrapper.mjs";

function parseArguments(argv) {
  const options = { force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--force") {
      options.force = true;
      continue;
    }
    if (!argument.startsWith("--")) {
      throw new Error(`unexpected argument: ${argument}`);
    }
    const key = argument.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`missing value for ${argument}`);
    }
    options[key] = value;
    index += 1;
  }
  return options;
}

async function writeAtomically(outputPath, content, force) {
  await mkdir(dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp-${process.pid}-${randomUUID()}`;
  await writeFile(temporaryPath, content, { flag: "wx" });
  try {
    if (force) {
      await rename(temporaryPath, outputPath);
    } else {
      await link(temporaryPath, outputPath);
      await unlink(temporaryPath);
    }
  } catch (error) {
    await unlink(temporaryPath).catch(() => {});
    if (error.code === "EEXIST") {
      throw new Error(`output already exists: ${outputPath}; pass --force to replace it`);
    }
    throw error;
  }
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  for (const required of [
    "input",
    "output",
    "title",
    "description",
    "artifact-id",
  ]) {
    if (!options[required]) throw new Error(`--${required} is required`);
  }

  const inputPath = resolve(options.input);
  const outputPath = resolve(options.output);
  const svg = await readFile(inputPath, "utf8");
  const result = buildHtmlDocument({
    svg,
    title: options.title,
    description: options.description,
    artifactId: options["artifact-id"],
    minSupportedWidth: options["min-width"]
      ? Number(options["min-width"])
      : 720,
    maxBytes: options["max-bytes"] ? Number(options["max-bytes"]) : 500_000,
  });

  await writeAtomically(outputPath, result.html, options.force);
  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        input: inputPath,
        output: outputPath,
        bytes: result.bytes,
        artifact_id: result.artifactId,
        source_svg_sha256: result.sourceSvgSha256,
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
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
