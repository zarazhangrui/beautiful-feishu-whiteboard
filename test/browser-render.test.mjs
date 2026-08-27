import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { chromium } from "playwright-core";

import {
  analyzeSnapshot,
  buildRenderReport,
  checkOfflineFallback,
  dependencyOrigins,
  discoverChrome,
  interactionSelectors,
  isAllowedRenderRequest,
  normalizeWidths,
  positiveInteger,
  renderHtmlFile,
} from "../scripts/lib/browser-render.mjs";

const CHROME = discoverChrome();

const interactiveSpec = {
  version: "1.0",
  type: "network",
  title: "交互式架构图",
  summary: "验证 390、820、1440 像素下的响应式布局与交互行为",
  content: {
    nodes: [
      { id: "a", label: "节点A" },
      { id: "b", label: "节点B" },
    ],
    edges: [{ id: "e1", source: "a", target: "b" }],
  },
  theme: { palette: "grove-block", tokens: {} },
  interactions: ["select", "filter", "zoom"],
  accessibility: {
    alt: "交互式架构图",
    instructions: "点击节点或使用工具栏查看状态变化。",
  },
};

const offlineSpec = {
  version: "1.0",
  type: "network",
  title: "离线降级示例",
  summary: "CDN 不可用时展示关键数据与降级提示",
  content: {
    nodes: [{ id: "a", label: "核心指标" }],
    edges: [],
  },
  theme: { palette: "grove-block", tokens: {} },
  interactions: ["select"],
  accessibility: {
    alt: "离线降级示例",
    instructions: "CDN 不可用时阅读降级说明。",
  },
};

test("discovers the first executable system Chrome candidate", () => {
  const candidates = ["/missing/chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"];
  const found = discoverChrome({
    candidates,
    isExecutable: (path) => path.includes("Google Chrome"),
  });
  assert.equal(found, candidates[1]);
});

test("returns null when no supported Chrome is executable", () => {
  assert.equal(discoverChrome({ candidates: ["/missing"], isExecutable: () => false }), null);
});

test("rejects invalid renderer integer options", () => {
  assert.equal(positiveInteger("720", "minSupportedWidth"), 720);
  for (const value of ["nope", "0", "-1", "12.5"]) {
    assert.throws(() => positiveInteger(value, "minSupportedWidth"), /positive integer/);
  }
});

test("normalizes configured widths into sorted unique positive viewports", () => {
  assert.deepEqual(normalizeWidths("390,820,1440,820"), [390, 820, 1440]);
  assert.throws(() => normalizeWidths("820,nope"), /positive integers/);
});

test("allows only the exact input file and declared dependency requests", () => {
  const input = "file:///tmp/index.html";
  const dependency = "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js";
  assert.equal(isAllowedRenderRequest(input, input), true);
  assert.equal(isAllowedRenderRequest(dependency, input, [dependency]), true);
  assert.equal(isAllowedRenderRequest("file:///etc/passwd", input), false);
  assert.equal(isAllowedRenderRequest("https://evil.example/x", input, [dependency]), false);
});

test("derives unique dependency origins for offline blocking", () => {
  const dependencies = [
    { url: "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js" },
    { url: "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/other.js" },
    { url: "https://unpkg.com/lucide@1.8.0/dist/umd/lucide.min.js" },
    { url: null },
  ];
  assert.deepEqual(dependencyOrigins(dependencies), [
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
  ]);
});

test("maps interactions to stable data-viz hooks", () => {
  assert.deepEqual(interactionSelectors("zoom"), [
    '[data-viz-action="zoom-in"]',
    '[data-viz-action="zoom"]',
  ]);
  assert.deepEqual(interactionSelectors("filter"), [
    "[data-viz-filter]",
    '[data-viz-action="filter"]',
  ]);
  assert.deepEqual(interactionSelectors("select"), [
    "[data-node-id]",
    "[data-viz-selectable]",
    '[data-viz-action="select"]',
  ]);
});

test("flags horizontal overflow and zero-height roots", () => {
  const clean = analyzeSnapshot({
    width: 820,
    rootHeight: 900,
    bodyClientWidth: 820,
    bodyScrollWidth: 820,
    domCount: 42,
    firstStableRenderMs: 120,
  });
  assert.deepEqual(clean.violations, []);
  assert.equal(clean.horizontalOverflow, false);

  const broken = analyzeSnapshot({
    width: 390,
    rootHeight: 0,
    bodyClientWidth: 390,
    bodyScrollWidth: 1200,
    domCount: 1,
    firstStableRenderMs: 10,
  });
  assert.deepEqual(
    broken.violations.map((item) => item.code).sort(),
    ["horizontal-overflow", "zero-height-root"],
  );
});

test("builds a stable report and aggregates every failure class", () => {
  const report = buildRenderReport({
    input: "/tmp/index.html",
    chromePath: "/chrome",
    snapshots: [
      {
        width: 820,
        violations: [{ code: "horizontal-overflow", message: "x" }],
      },
    ],
    interactions: [
      { interaction: "zoom", ok: false, error: "state-unchanged" },
    ],
    reducedMotion: { ok: false },
    offlineFallback: { ok: false, skipped: false },
    consoleErrors: ["boom"],
    pageErrors: [],
    requestErrors: [],
  });
  assert.equal(report.ok, false);
  assert.equal(report.input, "/tmp/index.html");
  assert.deepEqual(report.widths, [820]);
  assert.deepEqual(report.errors.console, ["boom"]);
});

async function buildFixture(sourceFile, spec) {
  const dir = await mkdtemp(join(tmpdir(), "browser-render-"));
  const specPath = join(dir, "visualization.spec.json");
  const sourcePath = join(dir, "page.source.html");
  await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`, "utf8");
  await writeFile(
    sourcePath,
    await readFile(new URL(`./fixtures/html/${sourceFile}`, import.meta.url), "utf8"),
    "utf8",
  );
  const outputDir = join(dir, "dist");
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
    ],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  return { dir, outputDir };
}

test(
  "renders 390/820/1440 without overflow, with interactions and reduced motion",
  { skip: !CHROME ? "system Chrome not found" : false },
  async () => {
    const { outputDir } = await buildFixture("interactive-safe.html", interactiveSpec);
    const manifest = JSON.parse(
      await readFile(join(outputDir, "visualization.manifest.json"), "utf8"),
    );
    const report = await renderHtmlFile({
      input: join(outputDir, "index.html"),
      outputDir: join(outputDir, "render"),
      widths: "390,820,1440",
      dependencies: manifest.dependencies,
      interactions: manifest.interactions,
    });
    assert.equal(report.ok, true, JSON.stringify(report, null, 2));
    assert.deepEqual(report.widths, [390, 820, 1440]);
    for (const snapshot of report.snapshots) {
      assert.deepEqual(snapshot.violations, []);
      assert.ok(snapshot.screenshot, `missing screenshot for ${snapshot.width}`);
      const files = await readdir(join(outputDir, "render"));
      assert.ok(files.includes(`index-${snapshot.width}.png`));
      assert.ok(snapshot.domCount > 0);
      assert.ok(snapshot.firstStableRenderMs >= 0);
    }
    for (const item of report.interactions) {
      assert.equal(item.ok, true, JSON.stringify(item));
    }
    assert.equal(report.reducedMotion.ok, true);
    assert.equal(report.reducedMotion.reported, "reduced");
    assert.equal(report.offlineFallback.skipped, true);
    assert.deepEqual(report.errors, { console: [], page: [], request: [] });
  },
);

test("offline CDN blocking reveals the fallback instead of an empty canvas", {
  skip: !CHROME ? "system Chrome not found" : false,
}, async () => {
  const { outputDir } = await buildFixture("offline-fallback.html", offlineSpec);
  const manifest = JSON.parse(
    await readFile(join(outputDir, "visualization.manifest.json"), "utf8"),
  );
  assert.ok(manifest.dependencies.length > 0);
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const inputUrl = pathToFileURL(resolve(join(outputDir, "index.html"))).href;
    const result = await checkOfflineFallback(browser, {
      inputUrl,
      dependencies: manifest.dependencies,
    });
    assert.equal(result.skipped, false);
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.visible, true);
  } finally {
    await browser.close();
  }
});

test("offline fallback is skipped when no dependencies are declared", async () => {
  const result = await checkOfflineFallback(null, {
    inputUrl: "file:///tmp/index.html",
    dependencies: [],
  });
  assert.equal(result.ok, true);
  assert.equal(result.skipped, true);
});
