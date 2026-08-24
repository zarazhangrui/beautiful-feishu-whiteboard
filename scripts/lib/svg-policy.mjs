import { DOMParser } from "@xmldom/xmldom";

const ALLOWED_ELEMENTS = new Set([
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
]);

const EXTERNAL_REFERENCE =
  /(?:https?:|data:|javascript:|file:|ftp:|\/\/)/i;
const LOCAL_URL_REFERENCE = /^url\(\s*#[A-Za-z_][\w:.-]*\s*\)$/;
const FONT_SIZE = /^(\d+(?:\.\d+)?)(?:px)?$/;

export class SvgPolicyError extends Error {
  constructor(violations) {
    super(
      `SVG policy validation failed: ${violations
        .map(({ code, message }) => `${code}: ${message}`)
        .join("; ")}`,
    );
    this.name = "SvgPolicyError";
    this.violations = violations;
  }
}

function parseViewBox(value) {
  if (!value) return null;
  const parts = value.trim().split(/[\s,]+/).map(Number);
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isFinite(part)) ||
    parts[2] <= 0 ||
    parts[3] <= 0
  ) {
    return null;
  }
  return {
    minX: parts[0],
    minY: parts[1],
    width: parts[2],
    height: parts[3],
  };
}

function parseFontSize(value) {
  if (!value) return null;
  const match = value.trim().match(FONT_SIZE);
  return match ? Number(match[1]) : null;
}

function hasMarkerAncestor(element) {
  for (let parent = element.parentNode; parent; parent = parent.parentNode) {
    if (parent.nodeType === 1 && parent.localName === "marker") return true;
  }
  return false;
}

function inspectReference(value) {
  if (EXTERNAL_REFERENCE.test(value)) return false;
  const references = value.match(/url\([^)]*\)/gi) ?? [];
  return references.every((reference) => LOCAL_URL_REFERENCE.test(reference));
}

export function validateSvg(
  svgText,
  {
    minSupportedWidth = 720,
    minBodyFontSize = 16,
    minSecondaryFontSize = 14,
    maxAspectRatio = 3,
  } = {},
) {
  const violations = [];
  if (/<!DOCTYPE|<!ENTITY/i.test(svgText)) {
    violations.push({
      code: "doctype",
      message: "DOCTYPE and entity declarations are not allowed",
    });
  }

  const parseErrors = [];
  const document = new DOMParser({
    onError: (level, message) => {
      if (level !== "warning") parseErrors.push(message);
    },
  }).parseFromString(svgText, "image/svg+xml");

  if (parseErrors.length > 0 || !document?.documentElement) {
    violations.push({
      code: "invalid-xml",
      message: parseErrors.join("; ") || "SVG could not be parsed",
    });
  }

  const root = document?.documentElement;
  if (!root || root.localName !== "svg") {
    violations.push({
      code: "invalid-root",
      message: "root element must be svg",
    });
  }

  const viewBox = root ? parseViewBox(root.getAttribute("viewBox")) : null;
  if (!viewBox) {
    violations.push({
      code: "invalid-viewbox",
      message: "svg must have a positive four-number viewBox",
    });
  }

  if (viewBox) {
    const aspectRatio = Math.max(
      viewBox.width / viewBox.height,
      viewBox.height / viewBox.width,
    );
    if (aspectRatio > maxAspectRatio) {
      violations.push({
        code: "aspect-ratio",
        message: `aspect ratio ${aspectRatio.toFixed(2)} exceeds ${maxAspectRatio}:1`,
      });
    }
  }

  let textCount = 0;
  let minimumEstimatedFontSize = Number.POSITIVE_INFINITY;
  const scale = viewBox
    ? Math.min(1, minSupportedWidth / viewBox.width)
    : 1;

  function walk(element, inheritedFontSize = null) {
    if (element.nodeType !== 1) return;
    const name = element.localName;

    if (!ALLOWED_ELEMENTS.has(name)) {
      violations.push({
        code: "disallowed-element",
        message: `<${name}> is not allowed`,
      });
    }
    if (name === "path" && !hasMarkerAncestor(element)) {
      violations.push({
        code: "path-outside-marker",
        message: "path is allowed only inside marker",
      });
    }

    for (let index = 0; index < element.attributes.length; index += 1) {
      const attribute = element.attributes.item(index);
      if (
        attribute.name === "xmlns" &&
        attribute.value === "http://www.w3.org/2000/svg"
      ) {
        continue;
      }
      if (/^on/i.test(attribute.name)) {
        violations.push({
          code: "event-attribute",
          message: `${attribute.name} is not allowed`,
        });
      }
      if (attribute.name === "style") {
        violations.push({
          code: "disallowed-attribute",
          message: "style attributes are not allowed; use presentation attributes",
        });
      }
      if (!inspectReference(attribute.value)) {
        violations.push({
          code: "external-reference",
          message: `${attribute.name} contains a forbidden reference`,
        });
      }
    }

    const ownFontSize = parseFontSize(element.getAttribute("font-size"));
    const effectiveInheritedFontSize = ownFontSize ?? inheritedFontSize;
    if (name === "text" || name === "tspan") {
      textCount += 1;
      const threshold =
        element.getAttribute("data-text-role") === "secondary"
          ? minSecondaryFontSize
          : minBodyFontSize;
      if (effectiveInheritedFontSize === null) {
        violations.push({
          code: "font-size",
          message: `<${name}> must have an explicit or inherited numeric font-size`,
        });
      } else {
        const estimated = effectiveInheritedFontSize * scale;
        minimumEstimatedFontSize = Math.min(
          minimumEstimatedFontSize,
          estimated,
        );
        if (estimated < threshold) {
          violations.push({
            code: "font-size",
            message: `<${name}> estimates to ${estimated.toFixed(2)}px, below ${threshold}px`,
          });
        }
      }
    }

    for (let child = element.firstChild; child; child = child.nextSibling) {
      if (child.nodeType === 1) walk(child, effectiveInheritedFontSize);
    }
  }

  if (root) walk(root);

  if (violations.length > 0) throw new SvgPolicyError(violations);

  return {
    viewBox,
    textCount,
    minimumEstimatedFontSize:
      minimumEstimatedFontSize === Number.POSITIVE_INFINITY
        ? null
        : Number(minimumEstimatedFontSize.toFixed(4)),
    minSupportedWidth,
    maxAspectRatio,
  };
}
