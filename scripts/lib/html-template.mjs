export function buildStaticStyle(minSupportedWidth) {
  return `
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
  `;
}
