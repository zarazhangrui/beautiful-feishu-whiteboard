import assert from "node:assert/strict";
import test from "node:test";

import { buildHtmlDocument } from "../scripts/lib/html-wrapper.mjs";
import {
  HtmlCheckError,
  checkHtml5Block,
  normalizedContentSha256,
} from "../scripts/lib/html-check.mjs";

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

test("accepts either supported height mode and rejects unknown modes", () => {
  const viewport = validHtml().replace(
    'name="html-box-height-mode" content="auto"',
    'name="html-box-height-mode" content="viewport"',
  );
  assert.equal(checkHtml5Block(viewport).ok, true);
  assert.throws(
    () => checkHtml5Block(viewport.replace('content="viewport"', 'content="fill"')),
    (error) => error.violations.some(({ code }) => code === "required-meta"),
  );
});

test("rejects executable markup, event attributes and relaxed CSP", () => {
  const cases = [
    validHtml().replace("</body>", "<script>alert(1)</script></body>"),
    validHtml().replace("<main ", '<main onclick="alert(1)" '),
    validHtml().replace("</body>", '<iframe srcdoc="x"></iframe></body>'),
    validHtml().replace("script-src 'none'", "script-src 'none' 'unsafe-inline'"),
  ];
  for (const html of cases) {
    assert.throws(
      () => checkHtml5Block(html),
      (error) =>
        error instanceof HtmlCheckError &&
        error.violations.some(({ code }) =>
          ["executable-markup", "event-attribute", "csp"].includes(code),
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
