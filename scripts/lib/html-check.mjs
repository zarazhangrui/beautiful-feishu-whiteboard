import { createHash } from "node:crypto";

const ARTIFACT_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const REQUIRED_META = [
  ["use-iframe", "true"],
  ["html-box-height-mode", "auto"],
  ["description", null],
  ["artifact-id", null],
  ["source-svg-sha256", null],
];
const REQUIRED_CSP = [
  "default-src 'none'",
  "script-src 'none'",
  "connect-src 'none'",
  "img-src 'none'",
  "font-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
];

export class HtmlCheckError extends Error {
  constructor(violations) {
    super(
      `HTML5 Block verification failed: ${violations
        .map(({ code, message }) => `${code}: ${message}`)
        .join("; ")}`,
    );
    this.name = "HtmlCheckError";
    this.violations = violations;
  }
}

function decodeAttribute(value) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function metaContent(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = html.match(new RegExp(`<meta\\b[^>]*\\bname=["']${escaped}["'][^>]*>`, "i"));
  if (!tag) return null;
  const content = tag[0].match(/\bcontent=(["'])(.*?)\1/i);
  return content ? decodeAttribute(content[2]) : null;
}

function cspContent(html) {
  const tag = html.match(/<meta\b[^>]*\bhttp-equiv=["']Content-Security-Policy["'][^>]*>/i);
  if (!tag) return null;
  const content = tag[0].match(/\bcontent=(["'])(.*?)\1/i);
  return content ? decodeAttribute(content[2]) : null;
}

export function normalizeHtmlContent(html) {
  return String(html)
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd();
}

export function normalizedContentSha256(html) {
  return createHash("sha256").update(normalizeHtmlContent(html)).digest("hex");
}

export function checkHtml5Block(
  html,
  { maxBytes = 500_000, expectedSourceSvgSha256 } = {},
) {
  const text = String(html);
  const violations = [];
  const bytes = Buffer.byteLength(text);
  if (bytes > maxBytes) {
    violations.push({
      code: "html-too-large",
      message: `${bytes} bytes exceeds ${maxBytes}`,
    });
  }

  const metadata = {};
  for (const [name, expected] of REQUIRED_META) {
    const value = metaContent(text, name);
    metadata[name] = value;
    if (value === null || value.trim() === "" || (expected !== null && value !== expected)) {
      violations.push({
        code: "required-meta",
        message: `${name} must be present${expected === null ? "" : ` with value ${expected}`}`,
      });
    }
  }

  const csp = cspContent(text);
  if (!csp || REQUIRED_CSP.some((directive) => !csp.includes(directive))) {
    violations.push({ code: "csp", message: "static deny-by-default CSP is required" });
  }

  const artifactId = metadata["artifact-id"];
  if (artifactId !== null && !ARTIFACT_ID.test(artifactId)) {
    violations.push({ code: "artifact-id", message: "artifact-id is malformed" });
  }
  const sourceSvgSha256 = metadata["source-svg-sha256"];
  if (sourceSvgSha256 !== null && !SHA256.test(sourceSvgSha256)) {
    violations.push({ code: "source-svg-sha256", message: "source SVG hash is malformed" });
  }
  if (
    expectedSourceSvgSha256 &&
    sourceSvgSha256 !== null &&
    sourceSvgSha256 !== expectedSourceSvgSha256
  ) {
    violations.push({ code: "source-hash-mismatch", message: "source SVG hash does not match" });
  }

  const svgCount = (text.match(/<svg\b/gi) ?? []).length;
  if (svgCount !== 1) {
    violations.push({ code: "svg-count", message: `expected one SVG, found ${svgCount}` });
  }

  const resourceAttributes = [...text.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)];
  const cssUrls = [...text.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/gi)];
  const externalResources = [
    ...resourceAttributes.map((match) => match[1]),
    ...cssUrls.map((match) => match[1]),
  ].filter((value) => !value.startsWith("#"));
  if (externalResources.length > 0) {
    violations.push({
      code: "external-resource",
      message: `external resources are forbidden: ${externalResources.join(", ")}`,
    });
  }

  if (violations.length > 0) throw new HtmlCheckError(violations);

  return {
    ok: true,
    bytes,
    artifactId,
    sourceSvgSha256,
    normalizedContentSha256: normalizedContentSha256(text),
    svgCount,
  };
}
