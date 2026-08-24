import { constants as fsConstants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { DOMParser } from "@xmldom/xmldom";

import { chromium } from "playwright-core";

export const DEFAULT_CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

function executableSync(path) {
  try {
    process.getBuiltinModule("fs").accessSync(path, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function discoverChrome({
  candidates = DEFAULT_CHROME_CANDIDATES,
  isExecutable = executableSync,
} = {}) {
  return candidates.find((candidate) => isExecutable(candidate)) ?? null;
}

export function normalizeWidths(widths) {
  const values = Array.isArray(widths) ? widths : String(widths).split(",");
  const parsed = values.map(Number);
  if (
    parsed.length === 0 ||
    parsed.some((width) => !Number.isInteger(width) || width <= 0)
  ) {
    throw new Error("widths must be a comma-separated list of positive integers");
  }
  return [...new Set(parsed)].sort((a, b) => a - b);
}

export function positiveInteger(value, name) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function artifactMinSupportedWidth(html) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const metas = document.getElementsByTagName("meta");
  for (let index = 0; index < metas.length; index += 1) {
    if (metas.item(index).getAttribute("name") === "min-supported-width") {
      return positiveInteger(
        metas.item(index).getAttribute("content"),
        "artifact min-supported-width",
      );
    }
  }
  throw new Error("artifact min-supported-width metadata is required");
}

export function screenFontSize(cssFontSize, matrix, renderedHeight) {
  const scaleX = matrix ? Math.hypot(matrix.a, matrix.b) : 1;
  const scaleY = matrix ? Math.hypot(matrix.c, matrix.d) : 1;
  const scaled = cssFontSize * Math.min(scaleX, scaleY);
  return Number(Math.min(scaled, renderedHeight || scaled).toFixed(3));
}

export function isAllowedRenderRequest(requestUrl, inputUrl) {
  return requestUrl === inputUrl;
}

export function analyzeSnapshot(snapshot, { minBodyFontSize = 16, minSecondaryFontSize = 14 } = {}) {
  const boundaryRight = Math.max(snapshot.width, snapshot.canvasClientWidth ?? 0);
  const boundaryBottom = snapshot.canvasHeight ?? Number.POSITIVE_INFINITY;
  const textSizeViolations = snapshot.text
    .filter((item) => item.fontSize < (item.role === "secondary" ? minSecondaryFontSize : minBodyFontSize))
    .map((item) => ({ text: item.text, fontSize: item.fontSize, role: item.role }));
  const clippingViolations = snapshot.text
    .filter(
      (item) =>
        item.left < -0.5 ||
        item.top < -0.5 ||
        item.right > boundaryRight + 0.5 ||
        item.bottom > boundaryBottom + 0.5,
    )
    .map((item) => ({ text: item.text, bounds: item }));
  const hasHorizontalOverflow =
    (snapshot.scrollerScrollWidth ?? 0) > (snapshot.scrollerClientWidth ?? 0) + 1;
  let overflowViolation = null;
  if (snapshot.width < (snapshot.minSupportedWidth ?? 0) && !hasHorizontalOverflow) {
    overflowViolation = "narrow viewport must expose the internal horizontal scroll fallback";
  }
  if ((snapshot.bodyScrollWidth ?? 0) > (snapshot.bodyClientWidth ?? 0) + 1) {
    overflowViolation = "document body must not overflow horizontally";
  }
  return { ...snapshot, textSizeViolations, clippingViolations, hasHorizontalOverflow, overflowViolation };
}

export function buildRenderReport({
  input,
  chromePath,
  snapshots,
  consoleErrors = [],
  pageErrors = [],
  requestErrors = [],
}) {
  const errors = { console: consoleErrors, page: pageErrors, request: requestErrors };
  const hasSnapshotViolations = snapshots.some(
    (snapshot) =>
      snapshot.textSizeViolations.length > 0 ||
      snapshot.clippingViolations.length > 0 ||
      snapshot.overflowViolation,
  );
  return {
    ok:
      !hasSnapshotViolations &&
      consoleErrors.length === 0 &&
      pageErrors.length === 0 &&
      requestErrors.length === 0,
    input,
    chromePath,
    widths: snapshots.map(({ width }) => width),
    snapshots,
    errors,
  };
}

async function measurePage(page, { width, minSupportedWidth }) {
  const raw = await page.evaluate(
    ({ viewportWidth, supportedWidth }) => {
      const body = document.body;
      const scroller = document.querySelector(".html5-scroll");
      const canvas = document.querySelector(".html5-canvas");
      const canvasRect = canvas?.getBoundingClientRect();
      const text = [...document.querySelectorAll("svg text, svg tspan")].map((element) => {
        const rect = element.getBoundingClientRect();
        const matrix = element.getScreenCTM?.();
        const cssFontSize = Number.parseFloat(getComputedStyle(element).fontSize);
        const scaleX = matrix ? Math.hypot(matrix.a, matrix.b) : 1;
        const scaleY = matrix ? Math.hypot(matrix.c, matrix.d) : 1;
        const scaledFontSize = cssFontSize * Math.min(scaleX, scaleY);
        return {
          text: element.textContent?.trim() ?? "",
          role: element.getAttribute("data-text-role") === "secondary" ? "secondary" : "body",
          fontSize: Number(Math.min(scaledFontSize, rect.height || scaledFontSize).toFixed(3)),
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      });
      return {
        width: viewportWidth,
        minSupportedWidth: supportedWidth,
        bodyClientWidth: body.clientWidth,
        bodyScrollWidth: body.scrollWidth,
        scrollerClientWidth: scroller?.clientWidth ?? 0,
        scrollerScrollWidth: scroller?.scrollWidth ?? 0,
        canvasClientWidth: canvas?.clientWidth ?? 0,
        canvasHeight: canvasRect?.height ?? 0,
        text,
      };
    },
    { viewportWidth: width, supportedWidth: minSupportedWidth },
  );
  return analyzeSnapshot(raw);
}

export async function renderHtmlFile({
  input,
  outputDir,
  widths = [720, 820, 1000],
  narrowWidth = 600,
  minSupportedWidth,
  chromePath = discoverChrome(),
  launch = (options) => chromium.launch(options),
}) {
  if (!chromePath) throw new Error("No executable system Chrome or Chromium was found");
  await access(input, fsConstants.R_OK);
  await mkdir(outputDir, { recursive: true });
  const supportedWidth =
    minSupportedWidth === undefined
      ? artifactMinSupportedWidth(await readFile(input, "utf8"))
      : positiveInteger(minSupportedWidth, "minSupportedWidth");
  const checkedNarrowWidth = positiveInteger(narrowWidth, "narrowWidth");
  const viewports = normalizeWidths([...normalizeWidths(widths), checkedNarrowWidth]);
  const browser = await launch({ executablePath: chromePath, headless: true });
  const consoleErrors = [];
  const pageErrors = [];
  const requestErrors = [];
  const snapshots = [];
  const inputUrl = pathToFileURL(resolve(input)).href;
  try {
    const page = await browser.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => requestErrors.push(`${request.url()}: ${request.failure()?.errorText}`));
    await page.route("**/*", async (route) => {
      if (isAllowedRenderRequest(route.request().url(), inputUrl)) await route.continue();
      else {
        requestErrors.push(`blocked external request: ${route.request().url()}`);
        await route.abort("blockedbyclient");
      }
    });
    for (const width of viewports) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(inputUrl, { waitUntil: "load" });
      const snapshot = await measurePage(page, {
        width,
        minSupportedWidth: supportedWidth,
      });
      const screenshot = resolve(outputDir, `${basename(input, ".html")}-${width}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      snapshots.push({ ...snapshot, screenshot });
    }
  } finally {
    await browser.close();
  }
  const report = buildRenderReport({ input, chromePath, snapshots, consoleErrors, pageErrors, requestErrors });
  const reportPath = resolve(outputDir, "report.json");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return { ...report, reportPath };
}
