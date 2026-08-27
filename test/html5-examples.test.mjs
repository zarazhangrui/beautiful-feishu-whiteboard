import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { chromium } from "playwright-core";

import { buildHtml5Page } from "../scripts/html5-build.mjs";
import { discoverChrome, renderHtmlFile } from "../scripts/lib/browser-render.mjs";
import { checkHtml5Block } from "../scripts/lib/html-check.mjs";
import { verifyManifest } from "../scripts/lib/html5-manifest.mjs";
import { validateVisualizationSpec } from "../scripts/lib/visualization-spec.mjs";

const CHROME = discoverChrome();
const ROOT = new URL("../html5/examples/", import.meta.url).pathname;

const EXPECTATIONS = {
  "project-architecture": {
    type: "network",
    interactions: ["select", "filter", "pan", "zoom"],
  },
  dashboard: {
    type: "dashboard",
    interactions: ["select", "filter", "toggle"],
  },
  prototype: {
    type: "prototype",
    interactions: ["input", "submit", "toggle"],
  },
  "via-company": {
    type: "network",
    interactions: ["select", "filter", "pan", "zoom"],
  },
};

for (const [name, expected] of Object.entries(EXPECTATIONS)) {
  test(`${name} builds and passes static verification`, async () => {
    const spec = JSON.parse(
      await readFile(join(ROOT, name, "visualization.spec.json"), "utf8"),
    );
    const sourceHtml = await readFile(join(ROOT, name, "page.source.html"), "utf8");

    const specReport = validateVisualizationSpec(spec);
    assert.deepEqual(specReport.violations, []);

    const result = await buildHtml5Page({ sourceHtml, spec, heightMode: "auto" });
    assert.equal(result.manifest.type, expected.type);
    assert.equal(result.manifest.heightMode, "auto");
    assert.deepEqual(result.manifest.dependencies, []);
    assert.deepEqual(result.manifest.interactions, expected.interactions);

    assert.equal(verifyManifest({ html: result.html, spec, manifest: result.manifest }), true);
    const checks = checkHtml5Block(result.html, { manifest: result.manifest });
    assert.equal(checks.ok, true);
    assert.ok(result.bytes < 500_000);
  });

  test(`${name} renders at 390/820/1440 with all declared interactions`, {
    skip: !CHROME ? "system Chrome not found" : false,
  }, async () => {
    const spec = JSON.parse(
      await readFile(join(ROOT, name, "visualization.spec.json"), "utf8"),
    );
    const sourceHtml = await readFile(join(ROOT, name, "page.source.html"), "utf8");
    const result = await buildHtml5Page({ sourceHtml, spec, heightMode: "auto" });

    const dir = await mkdtemp(join(tmpdir(), `html5-example-${name}-`));
    await writeFile(join(dir, "index.html"), result.html, "utf8");
    const report = await renderHtmlFile({
      input: join(dir, "index.html"),
      outputDir: join(dir, "render"),
      widths: "390,820,1440",
      dependencies: result.manifest.dependencies,
      interactions: result.manifest.interactions,
    });
    assert.equal(report.ok, true, JSON.stringify(report, null, 2));
    assert.deepEqual(report.widths, [390, 820, 1440]);
    for (const snapshot of report.snapshots) {
      assert.deepEqual(snapshot.violations, []);
    }
    for (const item of report.interactions) {
      assert.equal(item.ok, true, JSON.stringify(item));
    }
    assert.equal(report.reducedMotion.ok, true);
    assert.equal(report.offlineFallback.skipped, true);
    assert.deepEqual(report.errors, { console: [], page: [], request: [] });
  });
}

test("project-architecture edges are clickable and update the state panel", {
  skip: !CHROME ? "system Chrome not found" : false,
}, async () => {
  const name = "project-architecture";
  const spec = JSON.parse(
    await readFile(join(ROOT, name, "visualization.spec.json"), "utf8"),
  );
  const sourceHtml = await readFile(join(ROOT, name, "page.source.html"), "utf8");
  const result = await buildHtml5Page({ sourceHtml, spec, heightMode: "auto" });
  const dir = await mkdtemp(join(tmpdir(), "html5-edge-"));
  await writeFile(join(dir, "index.html"), result.html, "utf8");
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(resolve(join(dir, "index.html"))).href);
    const before = await page.textContent("[data-viz-state]");
    const after = await page.evaluate(() => {
      const edge = document.querySelector("[data-edge-id]");
      edge.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      );
      return document.querySelector("[data-viz-state]").textContent;
    });
    assert.notEqual(after, before);
    assert.match(after, /连线：/);
    assert.ok(after.includes("→"));
  } finally {
    await browser.close();
  }
});
