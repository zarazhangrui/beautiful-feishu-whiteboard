import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const FIXTURES = new URL("./fixtures/", import.meta.url);
const specPath = join(FIXTURES.pathname.replace("file://", ""), "spec/network.valid.json");
const sourcePath = join(FIXTURES.pathname.replace("file://", ""), "html/network.source.html");

function runBuild(outputDir, extra = []) {
  const result = spawnSync(
    process.execPath,
    [
      "scripts/html5-build.mjs",
      "--spec",
      specPath,
      "--input",
      sourcePath,
      "--output-dir",
      outputDir,
      ...extra,
    ],
    { encoding: "utf8" },
  );
  return result;
}

function runCheck(outputDir, extra = []) {
  const result = spawnSync(
    process.execPath,
    [
      "scripts/check-html5-block.mjs",
      "--spec",
      join(outputDir, "visualization.spec.json"),
      "--manifest",
      join(outputDir, "visualization.manifest.json"),
      "--input",
      join(outputDir, "index.html"),
      ...extra,
    ],
    { encoding: "utf8" },
  );
  return result;
}

async function tempDir(label) {
  return mkdtemp(join(tmpdir(), `html5-build-${label}-`));
}

test("build emits exactly index.html, the spec copy, and the manifest", async () => {
  const outputDir = await tempDir("emits");
  const result = runBuild(outputDir);
  assert.equal(result.status, 0, result.stderr);
  const files = (await readdir(outputDir)).sort();
  assert.deepEqual(files, [
    "index.html",
    "visualization.manifest.json",
    "visualization.spec.json",
  ]);
  const report = JSON.parse(result.stdout);
  assert.equal(report.ok, true);
  assert.deepEqual(report.files.sort(), files);
});

test("manifest hash and bytes match the emitted HTML", async () => {
  const outputDir = await tempDir("hash");
  const result = runBuild(outputDir);
  assert.equal(result.status, 0, result.stderr);
  const html = await readFile(join(outputDir, "index.html"), "utf8");
  const manifest = JSON.parse(
    await readFile(join(outputDir, "visualization.manifest.json"), "utf8"),
  );
  assert.equal(
    manifest.html.sha256,
    createHash("sha256").update(html, "utf8").digest("hex"),
  );
  assert.equal(manifest.html.bytes, Buffer.byteLength(html, "utf8"));
  assert.equal(manifest.type, "network");
  assert.equal(manifest.heightMode, "auto");
  assert.deepEqual(manifest.interactions, ["select", "filter", "pan", "zoom"]);
  assert.deepEqual(manifest.dependencies.map((item) => item.id), ["lucide@1.8.0"]);
});

test("rebuilding identical inputs is deterministic", async () => {
  const first = await tempDir("deterministic-a");
  const second = await tempDir("deterministic-b");
  assert.equal(runBuild(first).status, 0);
  assert.equal(runBuild(second).status, 0);
  const firstHtml = await readFile(join(first, "index.html"), "utf8");
  const secondHtml = await readFile(join(second, "index.html"), "utf8");
  assert.equal(firstHtml, secondHtml);
  const firstManifest = await readFile(join(first, "visualization.manifest.json"), "utf8");
  const secondManifest = await readFile(join(second, "visualization.manifest.json"), "utf8");
  assert.equal(firstManifest, secondManifest);
});

test("check accepts a freshly built artifact with a full report", async () => {
  const outputDir = await tempDir("check-ok");
  assert.equal(runBuild(outputDir).status, 0);
  const result = runCheck(outputDir);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.ok, true);
  assert.equal(report.protocolVersion, "1.0");
  assert.equal(report.type, "network");
  assert.equal(report.heightMode, "auto");
  assert.deepEqual(report.dependencies, ["lucide@1.8.0"]);
  assert.deepEqual(report.interactions, ["select", "filter", "pan", "zoom"]);
  assert.equal(report.svgCount, 1);
  assert.equal(report.scriptCount, 2);
  assert.match(report.sha256, /^[a-f0-9]{64}$/);
});

async function mutationTest(label, mutate, expectedCode) {
  const outputDir = await tempDir(label);
  assert.equal(runBuild(outputDir).status, 0);
  const htmlPath = join(outputDir, "index.html");
  const manifestPath = join(outputDir, "visualization.manifest.json");
  const html = await readFile(htmlPath, "utf8");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const { html: nextHtml, manifest: nextManifest } = mutate(html, manifest);
  await writeFile(htmlPath, nextHtml, "utf8");
  await writeFile(
    manifestPath,
    `${JSON.stringify(nextManifest ?? manifest, null, 2)}\n`,
    "utf8",
  );
  const result = runCheck(outputDir);
  assert.notEqual(result.status, 0);
  const payload = JSON.parse(result.stderr || result.stdout);
  assert.equal(payload.ok, false);
  assert.match(
    payload.error ?? JSON.stringify(payload.violations ?? payload),
    expectedCode,
  );
}

test("check fails when text changes without rebuilding the manifest", async () => {
  await mutationTest(
    "text",
    (html) => ({ html: html.replace("内容规划", "内容规划改"), manifest: null }),
    /manifest-drift/,
  );
});

test("check fails when geometry changes without rebuilding the manifest", async () => {
  await mutationTest(
    "geometry",
    (html) => ({ html: html.replace('x="40" y="60"', 'x="50" y="60"'), manifest: null }),
    /manifest-drift/,
  );
});

test("check fails when script content changes without rebuilding the manifest", async () => {
  await mutationTest(
    "script",
    (html) => ({ html: html.replace("state.scale = 1;", "state.scale = 2;"), manifest: null }),
    /manifest-drift/,
  );
});

test("check fails when a dependency changes without rebuilding the manifest", async () => {
  await mutationTest(
    "dependency",
    (html) => ({
      html: html.replace(
        "https://unpkg.com/lucide@1.8.0/dist/umd/lucide.min.js",
        "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js",
      ),
      manifest: null,
    }),
    /dependency-(?:not-allowlisted|integrity-mismatch)|manifest-drift/,
  );
});

test("check fails when the height mode changes without rebuilding the manifest", async () => {
  await mutationTest(
    "height",
    (html, manifest) => ({
      html,
      manifest: { ...manifest, heightMode: "viewport" },
    }),
    /height-mode-mismatch/,
  );
});

test("build rejects a page that declares reserved HTML5 Block metadata", async () => {
  const outputDir = await tempDir("reserved-meta");
  const source = await readFile(sourcePath, "utf8");
  const poisoned = source.replace(
    "<title>项目架构</title>",
    '<meta name="use-iframe" content="false"><title>项目架构</title>',
  );
  const poisonedPath = join(outputDir, "source.html");
  await writeFile(poisonedPath, poisoned, "utf8");
  const result = spawnSync(
    process.execPath,
    [
      "scripts/html5-build.mjs",
      "--spec",
      specPath,
      "--input",
      poisonedPath,
      "--output-dir",
      join(outputDir, "dist"),
    ],
    { encoding: "utf8" },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /reserved|metadata/i);
});
