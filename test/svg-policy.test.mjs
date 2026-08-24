import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  SvgPolicyError,
  validateSvg,
} from "../scripts/lib/svg-policy.mjs";

const defaults = {
  minSupportedWidth: 720,
  minBodyFontSize: 16,
  minSecondaryFontSize: 14,
  maxAspectRatio: 3,
};

const fixture = async (name) =>
  readFile(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

function expectViolation(svg, code, options = defaults) {
  assert.throws(
    () => validateSvg(svg, options),
    (error) => {
      assert.ok(error instanceof SvgPolicyError);
      assert.ok(
        error.violations.some((violation) => violation.code === code),
        `expected ${code}, got ${JSON.stringify(error.violations)}`,
      );
      return true;
    },
  );
}

test("accepts native shapes and local marker fragment references", async () => {
  const result = validateSvg(await fixture("valid.svg"), defaults);

  assert.equal(result.viewBox.width, 900);
  assert.equal(result.viewBox.height, 600);
  assert.equal(result.textCount, 1);
  assert.equal(result.minimumEstimatedFontSize, 19.2);
});

test("rejects a missing viewBox", () => {
  expectViolation(
    '<svg xmlns="http://www.w3.org/2000/svg"><text font-size="24">x</text></svg>',
    "invalid-viewbox",
  );
});

test("rejects executable and embedding elements", async () => {
  expectViolation(await fixture("unsafe-script.svg"), "disallowed-element");
  expectViolation(await fixture("unsafe-url.svg"), "disallowed-element");
});

test("rejects event handlers and external URL schemes", () => {
  expectViolation(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect onload="alert(1)" width="20" height="20"/></svg>',
    "event-attribute",
  );
  expectViolation(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><text font-size="24" fill="url(https://example.com/a)">x</text></svg>',
    "external-reference",
  );
  expectViolation(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><text font-size="24" data-x="javascript:alert(1)">x</text></svg>',
    "external-reference",
  );
});

test("rejects unknown attributes under the SVG allowlist", () => {
  expectViolation(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect mystery="value" width="20" height="20"/></svg>',
    "disallowed-attribute",
  );
});

test("rejects CSS escapes and non-color paint values", () => {
  expectViolation(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect width="20" height="20" fill="u\\72l(\\68 ttp:\\2f\\2f evil.example/a)"/></svg>',
    "unsafe-attribute-value",
  );
  expectViolation(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect width="20" height="20" fill="var(--paint)"/></svg>',
    "invalid-paint",
  );
});

test("normalizes fatal XML parser failures into policy violations", () => {
  expectViolation(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><text font-size="24">x</svg>',
    "invalid-xml",
  );
});

test("rejects an external entity declaration", () => {
  expectViolation(
    '<!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><text font-size="24">&xxe;</text></svg>',
    "doctype",
  );
});

test("allows path only as a marker child", () => {
  expectViolation(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><path d="M0 0L10 10"/></svg>',
    "path-outside-marker",
  );
});

test("rejects an excessive aspect ratio", () => {
  expectViolation(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 100"><text font-size="24">x</text></svg>',
    "aspect-ratio",
  );
});

test("rejects body text that becomes unreadable at the minimum width", () => {
  expectViolation(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1700 900"><text x="0" y="30" font-size="16">tiny</text></svg>',
    "font-size",
  );
});

test("uses the secondary threshold for explicitly secondary text", () => {
  const result = validateSvg(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><text x="0" y="30" font-size="18" data-text-role="secondary">note</text></svg>',
    defaults,
  );

  assert.equal(result.minimumEstimatedFontSize, 14.4);
});
