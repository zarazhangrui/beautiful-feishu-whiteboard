import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeSnapshot,
  buildRenderReport,
  discoverChrome,
  normalizeWidths,
} from "../scripts/lib/browser-render.mjs";

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

test("normalizes configured widths into sorted unique positive viewports", () => {
  assert.deepEqual(normalizeWidths("1000,720,820,820"), [720, 820, 1000]);
  assert.throws(() => normalizeWidths("820,nope"), /positive integers/);
});

test("calculates text-size and clipping violations from screen measurements", () => {
  const analysis = analyzeSnapshot({
    width: 720,
    bodyClientWidth: 720,
    bodyScrollWidth: 720,
    canvasClientWidth: 720,
    text: [
      { text: "Readable", role: "body", fontSize: 16, left: 10, right: 100, top: 10, bottom: 30 },
      { text: "Tiny", role: "secondary", fontSize: 11, left: 10, right: 50, top: 40, bottom: 52 },
      { text: "Cut", role: "body", fontSize: 18, left: 700, right: 740, top: 60, bottom: 82 },
    ],
  });
  assert.equal(analysis.textSizeViolations.length, 1);
  assert.equal(analysis.clippingViolations.length, 1);
  assert.equal(analysis.hasHorizontalOverflow, false);
});

test("requires internal horizontal overflow only below the supported width", () => {
  const narrow = analyzeSnapshot({
    width: 600,
    minSupportedWidth: 720,
    bodyClientWidth: 600,
    bodyScrollWidth: 600,
    scrollerClientWidth: 600,
    scrollerScrollWidth: 720,
    canvasClientWidth: 720,
    text: [],
  });
  assert.equal(narrow.hasHorizontalOverflow, true);
  assert.equal(narrow.overflowViolation, null);

  const broken = analyzeSnapshot({
    width: 600,
    minSupportedWidth: 720,
    bodyClientWidth: 600,
    bodyScrollWidth: 600,
    scrollerClientWidth: 600,
    scrollerScrollWidth: 600,
    canvasClientWidth: 600,
    text: [],
  });
  assert.match(broken.overflowViolation, /horizontal scroll fallback/);
});

test("builds a stable report schema and aggregates runtime errors", () => {
  const report = buildRenderReport({
    input: "/tmp/widget.html",
    chromePath: "/chrome",
    snapshots: [{ width: 820, textSizeViolations: [], clippingViolations: [], overflowViolation: null }],
    consoleErrors: ["boom"],
    pageErrors: [],
    requestErrors: [],
  });
  assert.equal(report.ok, false);
  assert.equal(report.input, "/tmp/widget.html");
  assert.deepEqual(report.widths, [820]);
  assert.deepEqual(report.errors.console, ["boom"]);
});
