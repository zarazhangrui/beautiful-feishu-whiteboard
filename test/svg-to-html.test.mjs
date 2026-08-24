import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  HtmlWrapperError,
  buildHtmlDocument,
} from "../scripts/lib/html-wrapper.mjs";

const svg = await readFile(
  new URL("./fixtures/valid.svg", import.meta.url),
  "utf8",
);

const input = {
  svg,
  title: "HTML5 <Block>",
  description: 'A safe "SVG" & wrapper',
  artifactId: "artifact-123",
  minSupportedWidth: 720,
  maxBytes: 500_000,
};

test("writes the required HTML5 Block metadata and source hash", () => {
  const result = buildHtmlDocument(input);
  const expectedHash = createHash("sha256").update(svg).digest("hex");

  assert.match(result.html, /<meta name="use-iframe" content="true">/);
  assert.match(
    result.html,
    /<meta name="html-box-height-mode" content="auto">/,
  );
  assert.match(
    result.html,
    /<meta name="artifact-id" content="artifact-123">/,
  );
  assert.match(
    result.html,
    new RegExp(`<meta name="source-svg-sha256" content="${expectedHash}">`),
  );
  assert.equal(result.sourceSvgSha256, expectedHash);
  assert.equal(result.artifactId, "artifact-123");
  assert.equal(result.bytes, Buffer.byteLength(result.html));
});

test("escapes metadata and adds accessible SVG semantics", () => {
  const { html } = buildHtmlDocument(input);

  assert.match(html, /<title>HTML5 &lt;Block&gt;<\/title>/);
  assert.match(
    html,
    /<meta name="description" content="A safe &quot;SVG&quot; &amp; wrapper">/,
  );
  assert.match(html, /role="img"/);
  assert.match(html, /aria-labelledby="artifact-123-title artifact-123-desc"/);
  assert.match(html, /<title id="artifact-123-title">HTML5 &lt;Block&gt;<\/title>/);
  assert.match(
    html,
    /<desc id="artifact-123-desc">A safe "SVG" &amp; wrapper<\/desc>/,
  );
});

test("adds accessibility through the XML DOM when root attributes contain greater-than signs", () => {
  const quotedAttributeSvg = svg.replace(
    "<svg ",
    '<svg aria-label="a > b" ',
  );
  const { html } = buildHtmlDocument({ ...input, svg: quotedAttributeSvg });

  assert.match(html, /aria-label="a &gt; b"/);
  assert.match(html, /role="img"/);
  assert.match(html, /<title id="artifact-123-title">/);
});

test("supports the explicit viewport height mode", () => {
  const { html } = buildHtmlDocument({ ...input, heightMode: "viewport" });
  assert.match(
    html,
    /<meta name="html-box-height-mode" content="viewport">/,
  );
  assert.throws(
    () => buildHtmlDocument({ ...input, heightMode: "fill" }),
    (error) =>
      error instanceof HtmlWrapperError && error.code === "invalid-height-mode",
  );
});

test("adds a static CSP, system fonts and narrow-width scroll fallback", () => {
  const { html } = buildHtmlDocument(input);

  assert.match(html, /default-src 'none'/);
  assert.match(html, /script-src 'none'/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /PingFang SC/);
  assert.match(html, /Microsoft YaHei/);
  assert.match(html, /svg text,[^}]*svg tspan \{ font-family: inherit; \}/);
  assert.match(html, /overflow-x: auto/);
  assert.match(html, /min-width: 720px/);
  assert.match(html, /:focus-visible/);
});

test("preserves SVG geometry while adding only accessibility metadata", () => {
  const { html } = buildHtmlDocument(input);

  assert.match(
    html,
    /<rect x="20" y="20" width="860" height="560" fill="#EFE9D9"\/>/,
  );
  assert.match(
    html,
    /<line x1="60" y1="140" x2="400" y2="140" stroke="#0F0F0F" marker-end="url\(#arrow\)"\/>/,
  );
});

test("rejects SVG that fails policy validation", () => {
  assert.throws(
    () =>
      buildHtmlDocument({
        ...input,
        svg: '<svg viewBox="0 0 900 600"><script>alert(1)</script></svg>',
      }),
    /SVG policy validation failed/,
  );
});

test("rejects an unsafe artifact id", () => {
  assert.throws(
    () => buildHtmlDocument({ ...input, artifactId: 'bad" id' }),
    (error) =>
      error instanceof HtmlWrapperError &&
      error.code === "invalid-artifact-id",
  );
});

test("enforces the final HTML byte limit", () => {
  assert.throws(
    () => buildHtmlDocument({ ...input, maxBytes: 100 }),
    (error) =>
      error instanceof HtmlWrapperError && error.code === "html-too-large",
  );
});

test("rejects non-finite and non-positive byte limits", () => {
  for (const maxBytes of [Number.NaN, 0, -1, 12.5]) {
    assert.throws(
      () => buildHtmlDocument({ ...input, maxBytes }),
      (error) =>
        error instanceof HtmlWrapperError && error.code === "invalid-max-bytes",
    );
  }
});
