import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { parse, serializeOuter } from "parse5";
import { validateCss, CssPolicyError } from "./css-policy.mjs";
import { validateJavaScript, JavaScriptPolicyError } from "./javascript-policy.mjs";
import { resolveAllowedDependency } from "./html5-manifest.mjs";
import { validateSvg, SvgPolicyError } from "./svg-policy.mjs";

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
// Bounds keep adversarial-but-byte-valid documents from exhausting traversal or
// diagnostic path construction before the HTML5 Block can be rejected safely.
export const MAX_DOM_DEPTH = 256;
export const MAX_DOM_NODES = 50_000;
const HEIGHT_MODES = new Set(["auto", "viewport"]);
const REQUIRED_NAMED_META = new Map([
  ["viewport", "width=device-width, initial-scale=1"],
  ["use-iframe", "true"],
  ["html-box-height-mode", null],
  ["description", null],
]);
const FORBIDDEN_ELEMENTS = new Set([
  "base",
  "iframe",
  "object",
  "embed",
  "frame",
  "frameset",
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

function attrs(node) {
  return new Map(
    (node.attrs ?? []).map(({ name, value }) => [name.toLowerCase(), value]),
  );
}

function children(node) {
  return node?.childNodes ?? [];
}

function collectNodes(root, violations) {
  const result = [];
  const stack = [{ node: root, path: "document", depth: 0 }];
  let limitExceeded = false;
  const addLimit = (message) => {
    if (limitExceeded) return;
    limitExceeded = true;
    violations.push({ code: "html-dom-limit", message });
  };
  while (stack.length) {
    const current = stack.pop();
    if (current.depth > MAX_DOM_DEPTH) {
      addLimit(`DOM depth exceeds ${MAX_DOM_DEPTH}`);
      continue;
    }
    if (result.length >= MAX_DOM_NODES) {
      addLimit(`DOM node count exceeds ${MAX_DOM_NODES}`);
      break;
    }
    result.push(current);
    const descendants = children(current.node).map((node, index) => ({
      node,
      path: `${current.path}/${node.tagName ?? node.nodeName}[${index}]`,
      depth: current.depth + 1,
    }));
    if (current.node?.content) {
      descendants.push({
        node: current.node.content,
        path: `${current.path}/template`,
        depth: current.depth + 1,
      });
    }
    for (let index = descendants.length - 1; index >= 0; index -= 1) {
      stack.push(descendants[index]);
    }
  }
  return { nodes: result, limitExceeded };
}

function addFromError(violations, error, prefix, path) {
  const nested = error.violations ?? [
    { code: prefix, message: error.message },
  ];
  for (const item of nested) {
    violations.push({
      code: prefix === "svg-policy" ? prefix : item.code,
      message: item.message,
      path,
      ...(item.location ? { location: item.location } : {}),
    });
  }
}

function validateDocumentStructure(document, violations) {
  const roots = children(document).filter((node) => node.tagName === "html");
  const doctypes = children(document).filter(
    (node) => node.nodeName === "#documentType",
  );
  const root = roots[0];
  const head = children(root).filter((node) => node.tagName === "head");
  const body = children(root).filter((node) => node.tagName === "body");
  const explicitStructure = [root, head[0], body[0]].every(
    (node) =>
      node?.sourceCodeLocation?.startTag && node?.sourceCodeLocation?.endTag,
  );
  if (
    roots.length !== 1 ||
    head.length !== 1 ||
    body.length !== 1 ||
    doctypes.length !== 1 ||
    root?.namespaceURI !== HTML_NAMESPACE ||
    !explicitStructure
  ) {
    violations.push({
      code: "html-structure",
      message:
        "one explicit doctype, HTML root, direct head, and direct body are required",
    });
  }
  return head[0] ?? null;
}

function validateDocumentElements({
  allElements,
  head,
  safeManifest,
  violations,
}) {
  let svgCount = 0;
  let scriptCount = 0;
  for (const { node, path } of allElements) {
    const name = node.tagName.toLowerCase();
    const attributes = attrs(node);
    if (FORBIDDEN_ELEMENTS.has(name)) {
      violations.push({
        code: "forbidden-element",
        message: `<${name}> is not allowed`,
        path,
      });
    }
    for (const key of attributes.keys()) {
      if (key.startsWith("on")) {
        violations.push({
          code: "event-attribute",
          message: `${key} is not allowed`,
          path,
        });
      }
    }
    if (name === "meta" && node.parentNode !== head) {
      violations.push({
        code: "required-meta",
        message: "meta elements must be direct children of head",
        path,
      });
    }
    if (
      (name === "form" && attributes.has("action")) ||
      attributes.has("formaction")
    ) {
      violations.push({
        code: "form-action",
        message: "form submission action is not allowed",
        path,
      });
    }
    if (
      name === "a" &&
      attributes.has("href") &&
      !attributes.get("href").startsWith("#")
    ) {
      violations.push({
        code: "navigation",
        message: "external navigation is not allowed",
        path,
      });
    }
    for (const key of ["srcset", "poster"]) {
      if (attributes.has(key)) {
        violations.push({
          code: "external-resource",
          message: `${key} is not allowed`,
          path,
        });
      }
    }
    if (attributes.has("style")) {
      try {
        validateCss(attributes.get("style"), { context: "declarationList" });
      } catch (error) {
        if (error instanceof CssPolicyError) {
          addFromError(violations, error, "css", path);
        } else {
          throw error;
        }
      }
    }
    const resourceKeys = ["src", "href", "action", "formaction"];
    if (
      resourceKeys.some((key) => attributes.has(key)) &&
      !["script", "a", "form"].includes(name)
    ) {
      for (const key of resourceKeys) {
        const value = attributes.get(key);
        if (
          value !== undefined &&
          !value.startsWith("#") &&
          !/^data:image\/(?:png|jpeg|gif|webp)(?:;|,)/i.test(value)
        ) {
          violations.push({
            code: "external-resource",
            message: `${key} resource is not allowed`,
            path,
          });
        }
      }
    }
    if (name === "style") {
      try {
        validateCss(children(node).map((child) => child.value ?? "").join(""));
      } catch (error) {
        if (error instanceof CssPolicyError) {
          addFromError(violations, error, "css", path);
        } else {
          throw error;
        }
      }
    }
    if (name === "script") {
      scriptCount++;
      if (attributes.has("src")) {
        validateExternalScript(node, safeManifest, violations, path);
      } else {
        try {
          validateJavaScript(
            children(node).map((child) => child.value ?? "").join(""),
          );
        } catch (error) {
          if (error instanceof JavaScriptPolicyError) {
            addFromError(violations, error, "javascript", path);
          } else {
            throw error;
          }
        }
      }
    }
    if (
      node.namespaceURI === SVG_NAMESPACE &&
      name === "svg" &&
      node.parentNode?.namespaceURI !== SVG_NAMESPACE
    ) {
      svgCount++;
      try {
        validateSvg(serializeOuter(node), {
          allowAccessibilityMetadata: true,
          interactive: true,
        });
      } catch (error) {
        if (error instanceof SvgPolicyError) {
          addFromError(violations, error, "svg-policy", path);
        } else {
          throw error;
        }
      }
    } else if (
      node.namespaceURI !== HTML_NAMESPACE &&
      node.namespaceURI !== SVG_NAMESPACE
    ) {
      violations.push({
        code: "html-namespace",
        message: `unexpected namespace on <${name}>`,
        path,
      });
    }
  }
  return { svgCount, scriptCount };
}

function validateTextNodes(allNodes, violations) {
  for (const { node, path } of allNodes) {
    if (
      node.nodeName === "#text" &&
      /<\/?script\b/i.test(node.value ?? "")
    ) {
      violations.push({
        code: "unsafe-html-text",
        message: "script-like entity text is not allowed",
        path,
      });
    }
  }
}

function validateDependencyUsage(safeManifest, usedUrls, violations) {
  for (const dependency of safeManifest.dependencies) {
    const count = usedUrls.filter((url) => url === dependency.url).length;
    if (count === 0) {
      violations.push({
        code: "dependency-unused",
        message: `declared dependency is not used: ${dependency.url}`,
      });
    } else if (count !== 1) {
      violations.push({
        code: "dependency-script-count",
        message: `declared dependency must have exactly one script tag: ${dependency.url}`,
      });
    }
  }
}

export function expectedCsp(dependencies) {
  const scripts = dependencies.map((item) => item.url);
  return [
    "default-src 'none'",
    `script-src 'unsafe-inline'${scripts.length ? ` ${scripts.join(" ")}` : ""}`,
    "style-src 'unsafe-inline'",
    "img-src data:",
    "font-src 'none'",
    "connect-src 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
}

function exactAttributes(attributeMap, names) {
  return (
    attributeMap.size === names.length &&
    names.every((name) => attributeMap.has(name))
  );
}

function normalizeManifest(manifest, violations) {
  if (
    !manifest ||
    typeof manifest !== "object" ||
    !HEIGHT_MODES.has(manifest.heightMode) ||
    !Array.isArray(manifest.dependencies)
  ) {
    violations.push({
      code: "invalid-manifest",
      message: "Manifest with heightMode and dependencies is required",
    });
    return { heightMode: "auto", dependencies: [] };
  }

  const dependencies = [];
  const seen = new Set();
  for (const dependency of manifest.dependencies) {
    const policy =
      dependency && typeof dependency.url === "string"
        ? resolveAllowedDependency(dependency.url)
        : null;
    if (
      !policy ||
      !isDeepStrictEqual(dependency, policy) ||
      seen.has(dependency.url)
    ) {
      violations.push({
        code: "invalid-manifest-dependency",
        message: "Manifest dependencies must be unique exact allowlist entries",
      });
      continue;
    }
    seen.add(dependency.url);
    dependencies.push(policy);
  }
  return { heightMode: manifest.heightMode, dependencies };
}

function validateMetadata(head, manifest, violations) {
  const metas = children(head).filter((node) => node.tagName === "meta");
  const values = new Map();
  let charsetCount = 0;
  let cspCount = 0;
  for (const meta of metas) {
    const attributes = attrs(meta);
    const name = (attributes.get("name") ?? "").toLowerCase();
    const httpEquiv = (attributes.get("http-equiv") ?? "").toLowerCase();
    const isCharset = exactAttributes(attributes, ["charset"]);
    const isNamed =
      REQUIRED_NAMED_META.has(name) &&
      exactAttributes(attributes, ["name", "content"]);
    const isCsp =
      httpEquiv === "content-security-policy" &&
      exactAttributes(attributes, ["http-equiv", "content"]);

    if ([isCharset, isNamed, isCsp].filter(Boolean).length !== 1) {
      violations.push({
        code: "forbidden-meta",
        message: "meta variants require mutually exclusive exact attribute sets",
      });
    }
    if (
      attributes.has("http-equiv") &&
      httpEquiv !== "content-security-policy"
    ) {
      violations.push({
        code: "forbidden-meta",
        message: `http-equiv ${httpEquiv || "(empty)"} is not allowed`,
      });
    }
    if (isCharset) {
      charsetCount += 1;
      if ((attributes.get("charset") ?? "").toLowerCase() !== "utf-8") {
        violations.push({ code: "required-meta", message: "charset must be utf-8" });
      }
    }
    if (isNamed) {
      if (values.has(name)) {
        violations.push({
          code: "required-meta",
          message: `${name} must appear exactly once`,
        });
      }
      values.set(name, attributes.get("content"));
    }
    if (isCsp) {
      cspCount += 1;
      if (attributes.get("content") !== expectedCsp(manifest.dependencies)) {
        violations.push({
          code: "csp",
          message: "generated CSP does not match the manifest",
        });
      }
    }
  }
  if (charsetCount !== 1) {
    violations.push({
      code: "required-meta",
      message: "exactly one utf-8 charset meta is required",
    });
  }
  for (const [name, exact] of REQUIRED_NAMED_META) {
    const value = values.get(name);
    if (!values.has(name) || !value?.trim() || (exact !== null && value !== exact)) {
      violations.push({
        code: "required-meta",
        message: `${name} must appear exactly once with a supported value`,
      });
    }
  }
  const heightMode = values.get("html-box-height-mode");
  if (!HEIGHT_MODES.has(heightMode)) {
    violations.push({
      code: "required-meta",
      message: "html-box-height-mode must be auto or viewport",
    });
  } else if (heightMode !== manifest.heightMode) {
    violations.push({
      code: "height-mode-mismatch",
      message: "metadata height mode does not match Manifest",
    });
  }
  if (cspCount !== 1) {
    violations.push({
      code: "csp",
      message: "exactly one generated CSP meta is required",
    });
  }
}

function validateExternalScript(node, manifest, violations, path) {
  const attributes = attrs(node);
  const url = attributes.get("src");
  const declared = manifest.dependencies.find((item) => item.url === url);
  const policy = url ? resolveAllowedDependency(url) : null;
  if (!declared || !policy) {
    violations.push({
      code: "dependency-not-allowlisted",
      message: `external script is not declared and allowlisted: ${url}`,
      path,
    });
    return;
  }
  if (!attributes.has("integrity")) {
    violations.push({
      code: "dependency-integrity-required",
      message: `integrity is required for ${url}`,
      path,
    });
  } else if (
    attributes.get("integrity") !== declared.integrity ||
    attributes.get("integrity") !== policy.integrity
  ) {
    violations.push({
      code: "dependency-integrity-mismatch",
      message: `integrity mismatch for ${url}`,
      path,
    });
  }
  if (!attributes.has("crossorigin")) {
    violations.push({
      code: "dependency-crossorigin-required",
      message: `crossorigin is required for ${url}`,
      path,
    });
  } else if (
    attributes.get("crossorigin") !== declared.crossorigin ||
    attributes.get("crossorigin") !== policy.crossorigin
  ) {
    violations.push({
      code: "dependency-crossorigin-mismatch",
      message: `crossorigin mismatch for ${url}`,
      path,
    });
  }
  if (!exactAttributes(attributes, ["src", "integrity", "crossorigin"])) {
    violations.push({
      code: "dependency-script-attributes",
      message: "external scripts require exactly src, integrity, and crossorigin",
      path,
    });
  }
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
  { manifest, maxBytes = 500_000 } = {},
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

  const safeManifest = normalizeManifest(manifest, violations);
  const parseErrors = [];
  const document = parse(text, {
    sourceCodeLocationInfo: true,
    onParseError: (error) => parseErrors.push(error),
  });
  for (const error of parseErrors) {
    if (error.code !== "missing-doctype") {
      violations.push({
        code: "invalid-html",
        message: error.code,
        location: { line: error.startLine, column: error.startCol },
      });
    }
  }

  const head = validateDocumentStructure(document, violations);
  if (head) validateMetadata(head, safeManifest, violations);
  const traversal = collectNodes(document, violations);
  if (traversal.limitExceeded) throw new HtmlCheckError(violations);
  const allNodes = traversal.nodes;
  const allElements = allNodes.filter(({ node }) => node.tagName);
  const { svgCount, scriptCount } = validateDocumentElements({
    allElements,
    head,
    safeManifest,
    violations,
  });
  validateTextNodes(allNodes, violations);
  const usedUrls = allElements
    .filter(
      ({ node }) => node.tagName === "script" && attrs(node).has("src"),
    )
    .map(({ node }) => attrs(node).get("src"));
  validateDependencyUsage(safeManifest, usedUrls, violations);
  if (violations.length) throw new HtmlCheckError(violations);
  return {
    ok: true,
    bytes,
    svgCount,
    scriptCount,
    heightMode: safeManifest.heightMode,
    normalizedContentSha256: normalizedContentSha256(text),
  };
}
