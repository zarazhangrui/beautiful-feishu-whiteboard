import { createHash } from "node:crypto";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

import { validateSvg } from "./svg-policy.mjs";

const ARTIFACT_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const REQUIRED_META = [
  ["use-iframe", new Set(["true"])],
  ["html-box-height-mode", new Set(["auto", "viewport"])],
  ["description", null],
  ["artifact-id", null],
  ["source-svg-sha256", null],
];
const REQUIRED_CSP = new Map([
  ["default-src", ["'none'"]],
  ["script-src", ["'none'"]],
  ["connect-src", ["'none'"]],
  ["img-src", ["'none'"]],
  ["font-src", ["'none'"]],
  ["object-src", ["'none'"]],
  ["frame-src", ["'none'"]],
  ["base-uri", ["'none'"]],
  ["form-action", ["'none'"]],
  ["style-src", ["'unsafe-inline'"]],
]);
const ALLOWED_HTML_ELEMENTS = new Set([
  "html",
  "head",
  "meta",
  "title",
  "style",
  "body",
  "main",
  "div",
  "svg",
  "g",
  "defs",
  "marker",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "text",
  "tspan",
  "path",
  "desc",
]);

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

function elements(root) {
  const result = [];
  function walk(node) {
    if (node?.nodeType === 1) result.push(node);
    for (let child = node?.firstChild; child; child = child.nextSibling) walk(child);
  }
  walk(root);
  return result;
}

function parseHtml(text, violations) {
  const errors = [];
  let document;
  try {
    document = new DOMParser({
      onError: (level, message) => {
        if (level !== "warning") errors.push(message);
      },
    }).parseFromString(text, "text/html");
  } catch (error) {
    errors.push(error.message);
  }
  if (!document?.documentElement || errors.length > 0) {
    violations.push({
      code: "invalid-html",
      message: errors.join("; ") || "HTML could not be parsed",
    });
  }
  return document;
}

function collectMetadata(document, violations) {
  const metadata = {};
  const metas = elements(document?.documentElement).filter(
    (element) => element.localName.toLowerCase() === "meta",
  );
  for (const [name, allowedValues] of REQUIRED_META) {
    const matches = metas.filter(
      (element) => (element.getAttribute("name") ?? "").toLowerCase() === name,
    );
    const value = matches[0]?.getAttribute("content") ?? null;
    metadata[name] = value;
    if (
      matches.length !== 1 ||
      value === null ||
      value.trim() === "" ||
      (allowedValues !== null && !allowedValues.has(value))
    ) {
      violations.push({
        code: "required-meta",
        message: `${name} must appear exactly once with a supported value`,
      });
    }
  }
  return { metadata, metas };
}

function parseCsp(value) {
  const directives = new Map();
  for (const segment of String(value ?? "").split(";")) {
    const tokens = segment.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    const [name, ...sources] = tokens;
    if (directives.has(name)) return null;
    directives.set(name, sources);
  }
  return directives;
}

function hasExactStaticCsp(metas) {
  const matches = metas.filter(
    (element) =>
      (element.getAttribute("http-equiv") ?? "").toLowerCase() ===
      "content-security-policy",
  );
  if (matches.length !== 1) return false;
  const directives = parseCsp(matches[0].getAttribute("content"));
  if (!directives || directives.size !== REQUIRED_CSP.size) return false;
  for (const [name, expectedSources] of REQUIRED_CSP) {
    const actualSources = directives.get(name);
    if (
      !actualSources ||
      actualSources.length !== expectedSources.length ||
      actualSources.some((source, index) => source !== expectedSources[index])
    ) {
      return false;
    }
  }
  return true;
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
  if (!Number.isInteger(maxBytes) || maxBytes <= 0 || maxBytes > 500_000) {
    violations.push({
      code: "invalid-max-bytes",
      message: "maxBytes must be a positive integer no greater than 500000",
    });
  } else if (bytes > maxBytes) {
    violations.push({
      code: "html-too-large",
      message: `${bytes} bytes exceeds ${maxBytes}`,
    });
  }

  const document = parseHtml(text, violations);
  const allElements = elements(document?.documentElement);
  const { metadata, metas } = collectMetadata(document, violations);
  if (!hasExactStaticCsp(metas)) {
    violations.push({
      code: "csp",
      message: "exact static deny-by-default CSP is required",
    });
  }

  for (const element of allElements) {
    const name = element.localName.toLowerCase();
    if (!ALLOWED_HTML_ELEMENTS.has(name)) {
      violations.push({
        code: "executable-markup",
        message: `<${name}> is not allowed`,
      });
    }
    for (let index = 0; index < element.attributes.length; index += 1) {
      const attribute = element.attributes.item(index);
      if (/^on/i.test(attribute.name)) {
        violations.push({
          code: "event-attribute",
          message: `${attribute.name} is not allowed`,
        });
      }
    }
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

  const svgElements = allElements.filter(
    (element) => element.localName.toLowerCase() === "svg",
  );
  if (svgElements.length !== 1) {
    violations.push({
      code: "svg-count",
      message: `expected one SVG, found ${svgElements.length}`,
    });
  } else {
    try {
      validateSvg(new XMLSerializer().serializeToString(svgElements[0]), {
        allowAccessibilityMetadata: true,
      });
    } catch (error) {
      violations.push({ code: "svg-policy", message: error.message });
    }
  }

  const resourceAttributes = [];
  for (const element of allElements) {
    for (const name of ["src", "href"]) {
      if (element.hasAttribute(name)) resourceAttributes.push(element.getAttribute(name));
    }
  }
  const cssUrls = [...text.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/gi)].map(
    (match) => match[1],
  );
  const externalResources = [...resourceAttributes, ...cssUrls].filter(
    (value) => !value.startsWith("#"),
  );
  if (externalResources.length > 0) {
    violations.push({
      code: "external-resource",
      message: `external resources are forbidden: ${externalResources.join(", ")}`,
    });
  }
  const styleText = allElements
    .filter((element) => element.localName.toLowerCase() === "style")
    .map((element) => element.textContent ?? "")
    .join("\n");
  if (/@import/i.test(styleText) || /\\/.test(styleText)) {
    violations.push({
      code: "unsafe-css",
      message: "CSS imports and escape sequences are forbidden",
    });
  }

  if (violations.length > 0) throw new HtmlCheckError(violations);

  return {
    ok: true,
    bytes,
    artifactId,
    sourceSvgSha256,
    normalizedContentSha256: normalizedContentSha256(text),
    svgCount: svgElements.length,
  };
}
