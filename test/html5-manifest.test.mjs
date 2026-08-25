import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import {
  buildHtml5Manifest,
  resolveAllowedDependency,
  verifyManifest,
} from "../scripts/lib/html5-manifest.mjs";

const ECHARTS_URL =
  "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js";

function makeSpec(overrides = {}) {
  return {
    version: "1.0",
    type: "dashboard",
    title: "Operations overview",
    summary: "Key service health indicators",
    content: {
      metrics: [{ id: "availability", label: "Availability", value: 99.9 }],
    },
    theme: { palette: "coral", tokens: {} },
    interactions: ["filter", "hover"],
    accessibility: {
      alt: "Operations health dashboard",
      instructions: "Use the filter to narrow the displayed services.",
    },
    ...overrides,
  };
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("discovers only exact allowlisted dependency URLs", async () => {
  const html = `<script defer src="${ECHARTS_URL}"></script>`;
  const manifest = await buildHtml5Manifest({
    html,
    spec: makeSpec(),
    heightMode: "auto",
  });

  assert.deepEqual(
    manifest.dependencies.map((item) => item.id),
    ["echarts@5.5.1"],
  );
  assert.equal(resolveAllowedDependency(ECHARTS_URL).id, "echarts@5.5.1");
});

test("rejects unversioned and undeclared external scripts", async () => {
  const rejectedUrls = [
    "https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js",
    "https://example.com/chart.js",
  ];

  for (const url of rejectedUrls) {
    await assert.rejects(
      buildHtml5Manifest({
        html: `<script src='${url}'></script>`,
        spec: makeSpec(),
        heightMode: "auto",
      }),
      /dependency-not-allowlisted/,
    );
  }
});

test("does not mistake script-looking text for a dependency", async () => {
  const html = `<p>&lt;script src="https://example.com/not-loaded.js"&gt;</p>`;
  const manifest = await buildHtml5Manifest({
    html,
    spec: makeSpec(),
    heightMode: "auto",
  });

  assert.deepEqual(manifest.dependencies, []);
});

test("hashes the exact final HTML outside the document", async () => {
  const html = "<!doctype html><html><head></head><body>完成</body></html>\n";
  const manifest = await buildHtml5Manifest({
    html,
    spec: makeSpec(),
    heightMode: "auto",
  });

  assert.equal(manifest.html.bytes, Buffer.byteLength(html, "utf8"));
  assert.equal(manifest.html.sha256, sha256(html));
  assert.match(manifest.html.sha256, /^[a-f0-9]{64}$/);
  assert.equal(html.includes(manifest.html.sha256), false);
});

test("records the complete derived manifest contract", async () => {
  const html = "<!doctype html><html><head></head><body>Dashboard</body></html>";
  const validation = { status: "passed", checks: ["static"] };
  const manifest = await buildHtml5Manifest({
    html,
    spec: makeSpec(),
    heightMode: "viewport",
    validation,
  });

  assert.deepEqual(manifest, {
    protocolVersion: "1.0",
    type: "dashboard",
    heightMode: "viewport",
    dependencies: [],
    interactions: ["filter", "hover"],
    browserTargets: [390, 820, 1440],
    html: {
      bytes: Buffer.byteLength(html, "utf8"),
      sha256: sha256(html),
    },
    validation,
  });
});

test("rejects invalid specs and height modes before creating a manifest", async () => {
  const invalidSpec = makeSpec({ interactions: ["zoom"] });
  await assert.rejects(
    buildHtml5Manifest({
      html: "<html></html>",
      spec: invalidSpec,
      heightMode: "auto",
    }),
    /invalid-visualization-spec/,
  );
  await assert.rejects(
    buildHtml5Manifest({
      html: "<html></html>",
      spec: makeSpec(),
      heightMode: "fixed",
    }),
    /invalid-height-mode/,
  );
});

test("verifyManifest rejects every derived-field drift", async () => {
  const html = `<script src="${ECHARTS_URL}"></script>`;
  const spec = makeSpec();
  const manifest = await buildHtml5Manifest({ html, spec, heightMode: "auto" });
  assert.equal(verifyManifest({ html, spec, manifest }), true);

  const drifts = [
    ["hash", { ...manifest, html: { ...manifest.html, sha256: "0".repeat(64) } }],
    ["bytes", { ...manifest, html: { ...manifest.html, bytes: 1 } }],
    ["type", { ...manifest, type: "chart" }],
    ["interactions", { ...manifest, interactions: ["hover"] }],
    ["dependencies", { ...manifest, dependencies: [] }],
    ["targets", { ...manifest, browserTargets: [820] }],
  ];

  for (const [field, changed] of drifts) {
    assert.throws(
      () => verifyManifest({ html, spec, manifest: changed }),
      /manifest-drift/,
      field,
    );
  }
});

test("every catalog palette has a complete CSS token mapping", async () => {
  const catalog = await readFile("CATALOG.md", "utf8");
  const templateSlugs = [...catalog.matchAll(/templates\/([a-z0-9-]+)\//g)].map(
    (match) => match[1],
  );
  const directories = (await readdir("templates", { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const map = JSON.parse(await readFile("html5/theme-token-map.json", "utf8"));
  const requiredTokens = [
    "background",
    "foreground",
    "card",
    "muted",
    "primary",
    "border",
    "success",
    "warning",
    "error",
    "radius",
    "shadow",
  ];

  assert.equal(new Set(templateSlugs).size, 35);
  assert.deepEqual([...new Set(templateSlugs)].sort(), directories);
  assert.deepEqual(Object.keys(map).sort(), directories);
  for (const slug of directories) {
    assert.deepEqual(Object.keys(map[slug]).sort(), [...requiredTokens].sort(), slug);
    for (const token of requiredTokens) {
      assert.equal(typeof map[slug][token], "string", `${slug}.${token}`);
      assert.notEqual(map[slug][token].trim(), "", `${slug}.${token}`);
    }
  }
});
