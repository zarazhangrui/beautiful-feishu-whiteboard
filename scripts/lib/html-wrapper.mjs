import { createHash } from "node:crypto";

import { validateSvg } from "./svg-policy.mjs";

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
  return svg.replace(
    /<svg\b([^>]*)>/,
    `<svg$1 role="img" aria-labelledby="${titleId} ${descriptionId}" tabindex="0" focusable="true">` +
      `<title id="${titleId}">${escapeText(title)}</title>` +
      `<desc id="${descriptionId}">${escapeText(description)}</desc>`,
  );
}

export function buildHtmlDocument({
  svg,
  title,
  description,
  artifactId,
  minSupportedWidth = 720,
  maxBytes = 500_000,
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

  const policy = validateSvg(svg, { minSupportedWidth });
  const sourceSvgSha256 = createHash("sha256").update(svg).digest("hex");
  const accessibleSvg = addSvgAccessibility(svg, {
    title,
    description,
    artifactId,
  });

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="use-iframe" content="true">
  <meta name="html-box-height-mode" content="auto">
  <meta name="description" content="${escapeAttribute(description)}">
  <meta name="artifact-id" content="${escapeAttribute(artifactId)}">
  <meta name="source-svg-sha256" content="${sourceSvgSha256}">
  <meta http-equiv="Content-Security-Policy" content="${escapeAttribute(STATIC_CSP)}">
  <title>${escapeText(title)}</title>
  <style>
    :root {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color-scheme: light;
    }
    * { box-sizing: border-box; }
    html, body { width: 100%; margin: 0; padding: 0; }
    body { overflow-x: hidden; }
    .html5-scroll { width: 100%; overflow-x: auto; }
    .html5-canvas { width: 100%; min-width: ${minSupportedWidth}px; }
    .html5-canvas svg { display: block; width: 100%; height: auto; max-width: none; }
    .html5-canvas svg text, .html5-canvas svg tspan { font-family: inherit; }
    .html5-canvas svg:focus-visible { outline: 3px solid #2563EB; outline-offset: -3px; }
  </style>
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
    policy,
  };
}
