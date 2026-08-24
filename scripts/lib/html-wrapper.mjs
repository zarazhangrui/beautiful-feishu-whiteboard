import { createHash } from "node:crypto";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

import { validateSvg } from "./svg-policy.mjs";
import { canonicalizeSvg } from "./svg-canonical.mjs";
import { buildStaticStyle } from "./html-template.mjs";

const ARTIFACT_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const STATIC_CSP = [
  "default-src 'none'",
  "script-src 'none'",
  "connect-src 'none'",
  "img-src 'none'",
  "font-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "style-src 'unsafe-inline'",
].join("; ");

export class HtmlWrapperError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "HtmlWrapperError";
    this.code = code;
  }
}

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeText(value).replaceAll('"', "&quot;");
}

function addSvgAccessibility(svg, { title, description, artifactId }) {
  const titleId = `${artifactId}-title`;
  const descriptionId = `${artifactId}-desc`;
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = document.documentElement;
  root.setAttribute("role", "img");
  root.setAttribute("aria-labelledby", `${titleId} ${descriptionId}`);
  root.setAttribute("tabindex", "0");
  root.setAttribute("focusable", "true");

  const titleElement = document.createElementNS(root.namespaceURI, "title");
  titleElement.setAttribute("id", titleId);
  titleElement.appendChild(document.createTextNode(String(title)));
  const descriptionElement = document.createElementNS(root.namespaceURI, "desc");
  descriptionElement.setAttribute("id", descriptionId);
  descriptionElement.appendChild(document.createTextNode(String(description)));
  root.insertBefore(descriptionElement, root.firstChild);
  root.insertBefore(titleElement, descriptionElement);

  return new XMLSerializer().serializeToString(root);
}

export function buildHtmlDocument({
  svg,
  title,
  description,
  artifactId,
  minSupportedWidth = 720,
  maxBytes = 500_000,
  heightMode = "auto",
}) {
  if (!ARTIFACT_ID.test(artifactId ?? "")) {
    throw new HtmlWrapperError(
      "invalid-artifact-id",
      "artifactId must be 1-128 URL- and HTML-id-safe characters",
    );
  }
  if (!String(title ?? "").trim() || !String(description ?? "").trim()) {
    throw new HtmlWrapperError(
      "missing-metadata",
      "title and description are required",
    );
  }
  if (!Number.isFinite(minSupportedWidth) || minSupportedWidth <= 0) {
    throw new HtmlWrapperError(
      "invalid-min-width",
      "minSupportedWidth must be positive",
    );
  }
  if (!Number.isInteger(maxBytes) || maxBytes <= 0 || maxBytes > 500_000) {
    throw new HtmlWrapperError(
      "invalid-max-bytes",
      "maxBytes must be a positive integer no greater than 500000",
    );
  }
  if (heightMode !== "auto") {
    throw new HtmlWrapperError(
      "invalid-height-mode",
      "heightMode must be auto; viewport is blocked pending trusted-client POC",
    );
  }

  const policy = validateSvg(svg, { minSupportedWidth });
  const sourceSvgSha256 = createHash("sha256").update(svg).digest("hex");
  const sourceSvgCanonicalSha256 = createHash("sha256")
    .update(canonicalizeSvg(svg))
    .digest("hex");
  const accessibleSvg = addSvgAccessibility(svg, {
    title,
    description,
    artifactId,
  });
  const staticStyle = buildStaticStyle(minSupportedWidth);

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="use-iframe" content="true">
  <meta name="html-box-height-mode" content="${heightMode}">
  <meta name="description" content="${escapeAttribute(description)}">
  <meta name="artifact-id" content="${escapeAttribute(artifactId)}">
  <meta name="source-svg-sha256" content="${sourceSvgSha256}">
  <meta name="source-svg-canonical-sha256" content="${sourceSvgCanonicalSha256}">
  <meta name="min-supported-width" content="${minSupportedWidth}">
  <meta http-equiv="Content-Security-Policy" content="${escapeAttribute(STATIC_CSP)}">
  <title>${escapeText(title)}</title>
  <style>${staticStyle}</style>
</head>
<body>
  <main class="html5-scroll" aria-label="${escapeAttribute(title)}">
    <div class="html5-canvas">
${accessibleSvg}
    </div>
  </main>
</body>
</html>
`;

  const bytes = Buffer.byteLength(html);
  if (bytes > maxBytes) {
    throw new HtmlWrapperError(
      "html-too-large",
      `generated HTML is ${bytes} bytes, above the ${maxBytes}-byte limit`,
    );
  }

  return {
    html,
    bytes,
    artifactId,
    sourceSvgSha256,
    sourceSvgCanonicalSha256,
    policy,
  };
}
