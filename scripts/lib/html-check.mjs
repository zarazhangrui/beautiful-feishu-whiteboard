import { createHash } from "node:crypto";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

import { validateSvg } from "./svg-policy.mjs";
import { canonicalizeSvgElement } from "./svg-canonical.mjs";
import { buildStaticStyle } from "./html-template.mjs";

const ARTIFACT_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const REQUIRED_META = [
  ["viewport", new Set(["width=device-width, initial-scale=1"])],
  ["use-iframe", new Set(["true"])],
  ["html-box-height-mode", new Set(["auto"])],
  ["description", null],
  ["artifact-id", null],
  ["source-svg-sha256", null],
  ["source-svg-canonical-sha256", null],
  ["min-supported-width", null],
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
const HTML_ATTRIBUTES = new Map([
  ["html", new Set(["lang"])],
  ["head", new Set()],
  ["title", new Set()],
  ["style", new Set()],
  ["body", new Set()],
  ["main", new Set(["class", "aria-label"])],
  ["div", new Set(["class"])],
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

function validateHtmlStructure(document, allElements, violations) {
  const root = document?.documentElement;
  const directChildren = elements(root).filter((element) => element.parentNode === root);
  const heads = directChildren.filter((element) => element.localName === "head");
  const bodies = directChildren.filter((element) => element.localName === "body");
  if (
    root?.localName !== "html" ||
    root?.namespaceURI !== HTML_NAMESPACE ||
    heads.length !== 1 ||
    bodies.length !== 1
  ) {
    violations.push({
      code: "html-structure",
      message: "exactly one HTML head and body must be direct children of html",
    });
  }
  const head = heads[0] ?? null;
  for (const element of allElements) {
    const expectedNamespace =
      element.localName === "svg" || element.namespaceURI === SVG_NAMESPACE
        ? SVG_NAMESPACE
        : HTML_NAMESPACE;
    if (element.namespaceURI !== expectedNamespace) {
      violations.push({
        code: "html-namespace",
        message: `<${element.nodeName}> uses an unexpected namespace`,
      });
    }
    if (element.localName === "meta" && element.parentNode !== head) {
      violations.push({
        code: "html-structure",
        message: "all meta elements must be direct children of head",
      });
    }
  }
  return head;
}

function collectMetadata(document, head, violations) {
  const metadata = {};
  const metas = elements(document?.documentElement).filter(
    (element) => element.localName.toLowerCase() === "meta" && element.parentNode === head,
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
  const charsets = metas.filter((element) => element.hasAttribute("charset"));
  if (
    charsets.length !== 1 ||
    charsets[0].getAttribute("charset").toLowerCase() !== "utf-8"
  ) {
    violations.push({ code: "required-meta", message: "utf-8 charset meta is required" });
  }
  const allowedNames = new Set(REQUIRED_META.map(([name]) => name));
  for (const meta of metas) {
    const name = (meta.getAttribute("name") ?? "").toLowerCase();
    const httpEquiv = (meta.getAttribute("http-equiv") ?? "").toLowerCase();
    const attributeNames = new Set();
    for (let index = 0; index < meta.attributes.length; index += 1) {
      attributeNames.add(meta.attributes.item(index).name);
    }
    const isCharset =
      meta.hasAttribute("charset") &&
      attributeNames.size === 1;
    const isNamed =
      allowedNames.has(name) &&
      attributeNames.size === 2 &&
      attributeNames.has("name") &&
      attributeNames.has("content");
    const isCsp =
      httpEquiv === "content-security-policy" &&
      attributeNames.size === 2 &&
      attributeNames.has("http-equiv") &&
      attributeNames.has("content");
    if ([isCharset, isNamed, isCsp].filter(Boolean).length !== 1) {
      violations.push({
        code: "forbidden-meta",
        message: "meta variants must use exact, mutually exclusive attribute sets",
      });
    }
  }
  return { metadata, metas };
}

function canonicalEmbeddedSourceSha256(svgElement, artifactId) {
  const clone = svgElement.cloneNode(true);
  for (const name of ["role", "aria-labelledby", "tabindex", "focusable"]) {
    clone.removeAttribute(name);
  }
  for (let child = clone.firstChild; child; ) {
    const next = child.nextSibling;
    if (
      child.nodeType === 1 &&
      ((child.localName === "title" && child.getAttribute("id") === `${artifactId}-title`) ||
        (child.localName === "desc" && child.getAttribute("id") === `${artifactId}-desc`))
    ) {
      clone.removeChild(child);
    }
    child = next;
  }
  return createHash("sha256")
    .update(canonicalizeSvgElement(clone))
    .digest("hex");
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
  {
    maxBytes = 500_000,
    expectedSourceSvgSha256,
    expectedSourceSvgCanonicalSha256,
  } = {},
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
  const head = validateHtmlStructure(document, allElements, violations);
  const { metadata, metas } = collectMetadata(document, head, violations);
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
    if (element.namespaceURI === HTML_NAMESPACE && name !== "meta") {
      const allowedAttributes = HTML_ATTRIBUTES.get(name) ?? new Set();
      for (let index = 0; index < element.attributes.length; index += 1) {
        const attribute = element.attributes.item(index);
        if (!allowedAttributes.has(attribute.name)) {
          violations.push({
            code: "disallowed-html-attribute",
            message: `${attribute.name} is not allowed on <${name}>`,
          });
        }
      }
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
  const canonicalSourceSvgSha256 = metadata["source-svg-canonical-sha256"];
  if (canonicalSourceSvgSha256 !== null && !SHA256.test(canonicalSourceSvgSha256)) {
    violations.push({
      code: "source-svg-canonical-sha256",
      message: "canonical source SVG hash is malformed",
    });
  }
  const minSupportedWidth = Number(metadata["min-supported-width"]);
  if (!Number.isInteger(minSupportedWidth) || minSupportedWidth <= 0) {
    violations.push({
      code: "min-supported-width",
      message: "min-supported-width must be a positive integer",
    });
  }
  if (
    expectedSourceSvgSha256 &&
    sourceSvgSha256 !== null &&
    sourceSvgSha256 !== expectedSourceSvgSha256
  ) {
    violations.push({ code: "source-hash-mismatch", message: "source SVG hash does not match" });
  }
  if (
    expectedSourceSvgCanonicalSha256 &&
    canonicalSourceSvgSha256 !== null &&
    canonicalSourceSvgSha256 !== expectedSourceSvgCanonicalSha256
  ) {
    violations.push({
      code: "source-canonical-hash-mismatch",
      message: "canonical source SVG hash does not match",
    });
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
        minSupportedWidth,
      });
    } catch (error) {
      violations.push({ code: "svg-policy", message: error.message });
    }
    if (
      canonicalSourceSvgSha256 &&
      ARTIFACT_ID.test(artifactId ?? "") &&
      canonicalEmbeddedSourceSha256(svgElements[0], artifactId) !==
        canonicalSourceSvgSha256
    ) {
      violations.push({
        code: "embedded-svg-hash",
        message: "embedded SVG does not match the canonical source hash",
      });
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
  const styleElements = allElements.filter(
    (element) =>
      element.namespaceURI === HTML_NAMESPACE && element.localName === "style",
  );
  if (
    !Number.isInteger(minSupportedWidth) ||
    styleElements.length !== 1 ||
    styleElements[0].attributes.length !== 0 ||
    styleElements[0].textContent !== buildStaticStyle(minSupportedWidth)
  ) {
    violations.push({
      code: "style-template",
      message: "exactly one unmodified static style template is required",
    });
  }
  if (
    Number.isInteger(minSupportedWidth) &&
    !styleText.includes(`min-width: ${minSupportedWidth}px`)
  ) {
    violations.push({
      code: "min-supported-width",
      message: "canvas CSS does not match min-supported-width metadata",
    });
  }
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
    canonicalSourceSvgSha256,
    minSupportedWidth,
    normalizedContentSha256: normalizedContentSha256(text),
    svgCount: svgElements.length,
  };
}
