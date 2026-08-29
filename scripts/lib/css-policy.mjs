import * as csstree from "css-tree";

export class CssPolicyError extends Error {
  constructor(violations) {
    super(`CSS policy validation failed: ${violations.map(({ code, message }) => `${code}: ${message}`).join("; ")}`);
    this.name = "CssPolicyError";
    this.violations = violations;
  }
}

function decodeCssEscapes(value) {
  return String(value).replace(/\\([0-9a-fA-F]{1,6})(?:\r\n|[\t\n\r\f ])?/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16))).replace(/\\([^\n\r\f0-9a-fA-F])/g, "$1");
}

function cleanUrl(value) {
  return decodeCssEscapes(value).trim().replace(/^(["'])([\s\S]*)\1$/, "$2").replace(/[\u0000-\u0020]+/g, "");
}

function allowedUrl(value, allowedExternalUrls) {
  const url = cleanUrl(value);
  if (url.startsWith("#")) return true;
  if (/^data:image\/(?:png|jpeg|gif|webp)(?:;|,|$)/i.test(url)) return true;
  return allowedExternalUrls.has(url);
}

export function validateCss(source, { context = "stylesheet", allowedExternalUrls = [] } = {}) {
  const violations = [];
  let ast;
  try {
    ast = csstree.parse(String(source), { context, positions: true });
  } catch (error) {
    throw new CssPolicyError([{ code: "css-parse", message: error.message, location: error.loc }]);
  }
  const allowed = new Set(allowedExternalUrls);
  const add = (code, message, node) => violations.push({ code, message, ...(node?.loc?.start ? { location: node.loc.start } : {}) });
  csstree.walk(ast, {
    enter(node) {
      if (node.type === "Atrule" && decodeCssEscapes(node.name).toLowerCase() === "import") add("css-import", "@import is not allowed", node);
      if (node.type === "Url" && !allowedUrl(node.value, allowed)) add("css-external-url", `URL is not allowed: ${cleanUrl(node.value)}`, node);
      if (node.type === "Function" && decodeCssEscapes(node.name).toLowerCase() === "image-set") {
        csstree.walk(node, (child) => {
          if (child !== node && child.type === "String" && !allowedUrl(child.value, allowed)) add("css-external-url", `image-set URL is not allowed: ${cleanUrl(child.value)}`, child);
        });
      }
    },
  });
  // css-tree preserves some escaped function tokens as Raw. Decode the generated
  // value, reparse it, and inspect scheme-bearing payloads so escapes cannot hide URLs.
  const normalized = decodeCssEscapes(csstree.generate(ast));
  for (const match of normalized.matchAll(/(?:url|image-set)\(\s*["']?([^)'",\s]+(?:\/\/[^)'",\s]*)?)/gi)) {
    if (!allowedUrl(match[1], allowed)) add("css-external-url", `URL is not allowed: ${cleanUrl(match[1])}`, ast);
  }
  if (violations.length) throw new CssPolicyError(violations);
  return { ok: true };
}
