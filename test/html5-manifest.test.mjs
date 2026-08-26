import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import * as manifestApi from "../scripts/lib/html5-manifest.mjs";

const { buildHtml5Manifest, resolveAllowedDependency, verifyManifest } =
  manifestApi;

const ECHARTS_URL =
  "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js";
const dependencyPolicy = JSON.parse(
  await readFile("html5/dependencies.json", "utf8"),
);
const echarts = dependencyPolicy.dependencies.find(
  (dependency) => dependency.url === ECHARTS_URL,
);

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

function externalScript(dependency, overrides = {}) {
  const attributes = {
    src: dependency.url,
    integrity: dependency.integrity,
    crossorigin: dependency.crossorigin,
    ...overrides,
  };
  return `<script ${Object.entries(attributes)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => `${name}="${value}"`)
    .join(" ")}></script>`;
}

function passedValidation(html) {
  const htmlSha256 = sha256(html);
  return {
    status: "passed",
    checks: [
      { id: "static", status: "passed", htmlSha256 },
      { id: "browser", status: "passed", htmlSha256 },
    ],
  };
}

test("discovers only exact allowlisted dependency URLs", async () => {
  for (const dependency of dependencyPolicy.dependencies) {
    assert.match(dependency.integrity, /^sha384-[A-Za-z0-9+/]+={0,2}$/);
    assert.equal(dependency.crossorigin, "anonymous");
  }
  const html = dependencyPolicy.dependencies
    .map((dependency) => externalScript(dependency))
    .join("\n");
  const manifest = await buildHtml5Manifest({
    html,
    spec: makeSpec(),
    heightMode: "auto",
  });

  assert.deepEqual(
    manifest.dependencies.map((item) => item.id),
    ["echarts@5.5.1", "lucide@1.8.0"],
  );
  assert.equal(resolveAllowedDependency(ECHARTS_URL).id, "echarts@5.5.1");
  assert.equal(
    resolveAllowedDependency(
      "https://unpkg.com/lucide@1.8.0/dist/umd/lucide.min.js",
    ).id,
    "lucide@1.8.0",
  );
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

test("rejects missing or mismatched SRI and crossorigin attributes", async () => {
  const cases = [
    ["dependency-integrity-required", { integrity: undefined }],
    ["dependency-integrity-mismatch", { integrity: "sha384-AAAA" }],
    ["dependency-crossorigin-required", { crossorigin: undefined }],
    ["dependency-crossorigin-mismatch", { crossorigin: "use-credentials" }],
  ];

  for (const [code, overrides] of cases) {
    await assert.rejects(
      buildHtml5Manifest({
        html: externalScript(echarts, overrides),
        spec: makeSpec(),
        heightMode: "auto",
      }),
      new RegExp(code),
    );
  }
});

test("uses HTML5 parsing for malformed comment boundaries", async () => {
  const active = '<script src="https://example.com/active.js"></script>';
  for (const html of [`<!-->${active}`, `<!-- malformed --!>${active}`]) {
    await assert.rejects(
      buildHtml5Manifest({ html, spec: makeSpec(), heightMode: "auto" }),
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
  const validation = passedValidation(html);
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

test("requires passed validation evidence bound to the final HTML", async () => {
  const html = "<!doctype html><html><body>evidence</body></html>";
  const good = passedValidation(html);
  const invalidEvidence = [
    { status: "passed" },
    { status: "passed", checks: [good.checks[0]] },
    {
      status: "passed",
      checks: [good.checks[0], { ...good.checks[1], htmlSha256: "0".repeat(64) }],
    },
    { status: "passed", checks: [good.checks[0], good.checks[0], good.checks[1]] },
    {
      status: "passed",
      checks: [
        ...good.checks,
        { id: "self-report", status: "passed", htmlSha256: sha256(html) },
      ],
    },
  ];

  for (const validation of invalidEvidence) {
    await assert.rejects(
      buildHtml5Manifest({
        html,
        spec: makeSpec(),
        heightMode: "auto",
        validation,
      }),
      /invalid-validation-evidence/,
    );
  }

  const manifest = await buildHtml5Manifest({
    html,
    spec: makeSpec(),
    heightMode: "auto",
    validation: good,
  });
  assert.deepEqual(manifest.validation, good);
  assert.equal(verifyManifest({ html, spec: makeSpec(), manifest }), true);

  const pendingManifest = await buildHtml5Manifest({
    html,
    spec: makeSpec(),
    heightMode: "auto",
  });
  assert.throws(
    () =>
      verifyManifest({
        html,
        spec: makeSpec(),
        manifest: { ...pendingManifest, validation: { status: "passed" } },
      }),
    /invalid-validation-evidence/,
  );
});

test("accepts pending evidence and rejects non-plain validation values", async () => {
  const base = { html: "<html></html>", spec: makeSpec(), heightMode: "auto" };
  const manifest = await buildHtml5Manifest({
    ...base,
    validation: { status: "pending" },
  });
  assert.deepEqual(manifest.validation, { status: "pending", checks: [] });

  for (const validation of [null, [], "pending", new Date()]) {
    await assert.rejects(
      buildHtml5Manifest({ ...base, validation }),
      /invalid-validation-evidence/,
    );
  }
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
  const html = externalScript(echarts);
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

test("dependency policy has a strict, unique schema", () => {
  assert.equal(manifestApi.validateDependencyPolicy(dependencyPolicy), true);
  const first = dependencyPolicy.dependencies[0];
  const invalidPolicies = [
    { ...dependencyPolicy, unexpected: true },
    { ...dependencyPolicy, dependencies: [...dependencyPolicy.dependencies, first] },
    {
      ...dependencyPolicy,
      dependencies: [
        ...dependencyPolicy.dependencies,
        { ...first, id: "duplicate-url@1.0.0" },
      ],
    },
    {
      ...dependencyPolicy,
      dependencies: dependencyPolicy.dependencies.map((item, index) =>
        index === 0 ? { ...item, integrity: "sha384-not base64!" } : item,
      ),
    },
    {
      ...dependencyPolicy,
      dependencies: dependencyPolicy.dependencies.map((item, index) =>
        index === 0 ? { ...item, crossorigin: "use-credentials" } : item,
      ),
    },
    {
      ...dependencyPolicy,
      dependencies: dependencyPolicy.dependencies.map((item, index) =>
        index === 0 ? { ...item, allowedTypes: ["unknown"] } : item,
      ),
    },
  ];
  for (const policy of invalidPolicies) {
    assert.throws(
      () => manifestApi.validateDependencyPolicy(policy),
      /invalid-dependency-policy/,
    );
  }
});

function relativeLuminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first, second) {
  const values = [relativeLuminance(first), relativeLuminance(second)].sort(
    (left, right) => right - left,
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
}

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
    for (const token of requiredTokens.slice(0, 9)) {
      assert.match(map[slug][token], /^#[0-9A-F]{6}$/i, `${slug}.${token}`);
    }
    assert.match(map[slug].radius, /^(?:0|\d+(?:\.\d+)?(?:px|rem))$/);
    assert.match(
      map[slug].shadow,
      /^(?:none|(?:-?(?:0|\d+(?:\.\d+)?px)\s+){2,4}(?:#[0-9A-F]{3,8}|rgba?\([^)]*\)))$/i,
      `${slug}.shadow`,
    );
    assert.ok(
      contrastRatio(map[slug].foreground, map[slug].background) >= 4.5,
      `${slug} foreground/background contrast`,
    );
  }

  for (const line of catalog.split("\n")) {
    const slug = /templates\/([a-z0-9-]+)\//.exec(line)?.[1];
    if (!slug) continue;
    const signature = [...line.matchAll(/#[0-9A-F]{6}/gi)].map((match) =>
      match[0].toUpperCase(),
    );
    const mappedColors = new Set(
      Object.values(map[slug]).map((value) => value.toUpperCase()),
    );
    const design = (
      await readFile(`templates/${slug}/design.md`, "utf8")
    ).toUpperCase();
    for (const color of signature) {
      assert.ok(design.includes(color), `${slug} design defines ${color}`);
      assert.ok(mappedColors.has(color), `${slug} preserves ${color}`);
    }
  }
});
