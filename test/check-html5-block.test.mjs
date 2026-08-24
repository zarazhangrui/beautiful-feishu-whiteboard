import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { buildHtmlDocument } from "../scripts/lib/html-wrapper.mjs";
import {
  HtmlCheckError,
  checkHtml5Block,
  normalizedContentSha256,
} from "../scripts/lib/html-check.mjs";
import { canonicalizeSvg } from "../scripts/lib/svg-canonical.mjs";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400"><rect width="720" height="400" fill="#fff"/><text x="40" y="80" font-size="20">Architecture</text></svg>`;

function validHtml() {
  return buildHtmlDocument({
    svg,
    title: "Architecture",
    description: "Project architecture",
    artifactId: "project-architecture-v1",
  }).html;
}

test("accepts a wrapped artifact and reports its identity", () => {
  const report = checkHtml5Block(validHtml());
  assert.equal(report.ok, true);
  assert.equal(report.artifactId, "project-architecture-v1");
  assert.match(report.sourceSvgSha256, /^[a-f0-9]{64}$/);
  assert.equal(report.svgCount, 1);
  assert.ok(report.bytes > 0);
});

test("rejects missing required metadata and CSP", () => {
  const html = validHtml()
    .replace(/\s*<meta name="artifact-id"[^>]*>/, "")
    .replace(/\s*<meta http-equiv="Content-Security-Policy"[^>]*>/, "");
  assert.throws(
    () => checkHtml5Block(html),
    (error) =>
      error instanceof HtmlCheckError &&
      error.violations.some(({ code }) => code === "required-meta") &&
      error.violations.some(({ code }) => code === "csp"),
  );
});

test("rejects unverified height modes", () => {
  const viewport = validHtml().replace(
    'name="html-box-height-mode" content="auto"',
    'name="html-box-height-mode" content="viewport"',
  );
  assert.throws(
    () => checkHtml5Block(viewport),
    (error) => error.violations.some(({ code }) => code === "required-meta"),
  );
});

test("requires metadata in the HTML head with the correct namespace", () => {
  const cases = [
    validHtml().replace(
      /(<meta http-equiv="Content-Security-Policy"[^>]*>)/,
      "</head><body>$1</body><head>",
    ),
    validHtml().replace(
      '<meta name="artifact-id"',
      '<x:meta xmlns:x="urn:test" name="artifact-id"',
    ),
    validHtml().replace(
      "</head>",
      '<meta http-equiv="refresh" content="30;url=file:///etc/passwd"></head>',
    ),
    validHtml().replace(
      '<meta name="description"',
      '<meta http-equiv="refresh" name="description"',
    ),
  ];
  for (const html of cases) {
    assert.throws(
      () => checkHtml5Block(html),
      (error) =>
        error instanceof HtmlCheckError &&
        error.violations.some(({ code }) =>
          ["html-structure", "html-namespace", "forbidden-meta"].includes(code),
        ),
    );
  }
});

test("rejects executable markup, event attributes and relaxed CSP", () => {
  const cases = [
    validHtml().replace("</body>", "<script>alert(1)</script></body>"),
    validHtml().replace("<main ", '<main onclick="alert(1)" '),
    validHtml().replace("</body>", '<iframe srcdoc="x"></iframe></body>'),
    validHtml().replace("script-src 'none'", "script-src 'none' 'unsafe-inline'"),
    validHtml().replace(
      "</head>",
      '<style>.html5-canvas:active{background-image:image-set("https://evil.example/x" 1x)}</style></head>',
    ),
  ];
  for (const html of cases) {
    assert.throws(
      () => checkHtml5Block(html),
      (error) =>
        error instanceof HtmlCheckError &&
        error.violations.some(({ code }) =>
          ["executable-markup", "event-attribute", "csp", "style-template"].includes(code),
        ),
    );
  }
});

test("rejects malformed artifact and source hashes", () => {
  const html = validHtml()
    .replace('content="project-architecture-v1"', 'content="bad id"')
    .replace(/(<meta name="source-svg-sha256" content=")[a-f0-9]+/, "$1oops");
  assert.throws(
    () => checkHtml5Block(html),
    (error) =>
      error.violations.some(({ code }) => code === "artifact-id") &&
      error.violations.some(({ code }) => code === "source-svg-sha256"),
  );
});

test("rejects external resources and multiple target SVGs", () => {
  const html = validHtml()
    .replace("</body>", '<img src="https://example.com/a.png"><svg viewBox="0 0 1 1"></svg></body>');
  assert.throws(
    () => checkHtml5Block(html),
    (error) =>
      error.violations.some(({ code }) => code === "external-resource") &&
      error.violations.some(({ code }) => code === "svg-count"),
  );
});

test("enforces maximum artifact bytes", () => {
  assert.throws(
    () => checkHtml5Block(validHtml(), { maxBytes: 100 }),
    (error) => error.violations.some(({ code }) => code === "html-too-large"),
  );
});

test("rejects invalid maximum byte limits", () => {
  for (const maxBytes of [Number.NaN, 0, -1, 12.5]) {
    assert.throws(
      () => checkHtml5Block(validHtml(), { maxBytes }),
      (error) => error.violations.some(({ code }) => code === "invalid-max-bytes"),
    );
  }
});

test("normalizes line endings and trailing whitespace before hashing", () => {
  const unix = "<p>a</p>\n<p>b</p>\n";
  const windows = "<p>a</p>\r\n<p>b</p>  \r\n\r\n";
  assert.equal(normalizedContentSha256(unix), normalizedContentSha256(windows));
});

test("checks an expected source SVG hash when supplied", () => {
  assert.throws(
    () => checkHtml5Block(validHtml(), { expectedSourceSvgSha256: "0".repeat(64) }),
    (error) => error.violations.some(({ code }) => code === "source-hash-mismatch"),
  );
});

test("binds the actual embedded SVG to the canonical source hash", () => {
  const modified = validHtml().replace('fill="#fff"', 'fill="#000"');
  assert.throws(
    () => checkHtml5Block(modified),
    (error) => error.violations.some(({ code }) => code === "embedded-svg-hash"),
  );
});

test("binds expected raw and canonical hashes to the same source", () => {
  const sourceA = svg.replace("#fff", "#111");
  const sourceB = svg.replace("#fff", "#222");
  const htmlB = buildHtmlDocument({
    svg: sourceB,
    title: "Architecture",
    description: "Project architecture",
    artifactId: "project-architecture-v1",
  }).html.replace(
    /(<meta name="source-svg-sha256" content=")[a-f0-9]+/,
    `$1${createHash("sha256").update(sourceA).digest("hex")}`,
  );
  assert.throws(
    () =>
      checkHtml5Block(htmlB, {
        expectedSourceSvgSha256: createHash("sha256").update(sourceA).digest("hex"),
        expectedSourceSvgCanonicalSha256: createHash("sha256")
          .update(canonicalizeSvg(sourceA))
          .digest("hex"),
      }),
    (error) =>
      error.violations.some(
        ({ code }) => code === "source-canonical-hash-mismatch",
      ),
  );
});

test("canonicalization includes CDATA text", () => {
  const before = canonicalizeSvg(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400"><text font-size="20"><![CDATA[SECRET-A]]></text></svg>',
  );
  const after = canonicalizeSvg(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400"><text font-size="20"><![CDATA[SECRET-B]]></text></svg>',
  );
  assert.notEqual(before, after);
});

test("validates custom minimum widths under the artifact contract", () => {
  const wideSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500"><text x="20" y="40" font-size="16">Readable</text></svg>`;
  const html = buildHtmlDocument({
    svg: wideSvg,
    title: "Wide",
    description: "Wide artifact",
    artifactId: "wide",
    minSupportedWidth: 1000,
  }).html;
  assert.equal(checkHtml5Block(html).ok, true);
});
