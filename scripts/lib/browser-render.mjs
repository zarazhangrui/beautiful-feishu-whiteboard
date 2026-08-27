import { constants as fsConstants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";
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

export const DEFAULT_WIDTHS = Object.freeze([390, 820, 1440]);

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

export function isAllowedRenderRequest(requestUrl, inputUrl, allowedUrls = []) {
  return requestUrl === inputUrl || allowedUrls.includes(requestUrl);
}

export function dependencyOrigins(dependencies = []) {
  const origins = new Set();
  for (const dependency of dependencies) {
    const url = dependency?.url;
    if (!url) continue;
    try {
      origins.add(new URL(url).origin);
    } catch {
      // Unparsable dependency URLs are rejected by the static policy before
      // rendering; ignore them here so offline blocking stays predictable.
    }
  }
  return [...origins];
}

export function interactionSelectors(interaction) {
  if (interaction === "filter") {
    return ["[data-viz-filter]", '[data-viz-action="filter"]'];
  }
  if (interaction === "select") {
    return ["[data-node-id]", "[data-viz-selectable]", '[data-viz-action="select"]'];
  }
  if (interaction === "zoom") {
    return ['[data-viz-action="zoom-in"]', '[data-viz-action="zoom"]'];
  }
  if (interaction === "pan") {
    return ['[data-viz-action="pan"]', '[data-viz-action="pan-left"]'];
  }
  return [
    `[data-viz-action="${interaction}"]`,
    `[data-viz-action="toggle-${interaction}"]`,
  ];
}

export function analyzeSnapshot({
  width,
  rootHeight,
  bodyClientWidth,
  bodyScrollWidth,
  domCount,
  firstStableRenderMs,
}) {
  const violations = [];
  const horizontalOverflow = bodyScrollWidth > bodyClientWidth + 1;
  const zeroHeightRoot = rootHeight <= 0;
  if (horizontalOverflow) {
    violations.push({
      code: "horizontal-overflow",
      message: `${bodyScrollWidth}px content exceeds the ${bodyClientWidth}px viewport`,
    });
  }
  if (zeroHeightRoot) {
    violations.push({
      code: "zero-height-root",
      message: `root height is ${rootHeight}px`,
    });
  }
  return {
    width,
    rootHeight,
    bodyClientWidth,
    bodyScrollWidth,
    horizontalOverflow,
    zeroHeightRoot,
    domCount,
    firstStableRenderMs,
    violations,
  };
}

export function buildRenderReport({
  input,
  chromePath,
  snapshots,
  interactions = [],
  reducedMotion,
  offlineFallback,
  consoleErrors = [],
  pageErrors = [],
  requestErrors = [],
}) {
  const errors = { console: consoleErrors, page: pageErrors, request: requestErrors };
  const snapshotViolations = snapshots.flatMap((snapshot) => snapshot.violations);
  const interactionFailures = interactions.filter((item) => !item.ok);
  const ok =
    snapshotViolations.length === 0 &&
    interactionFailures.length === 0 &&
    reducedMotion?.ok !== false &&
    offlineFallback?.ok !== false &&
    consoleErrors.length === 0 &&
    pageErrors.length === 0 &&
    requestErrors.length === 0;
  return {
    ok,
    input,
    chromePath,
    widths: snapshots.map((snapshot) => snapshot.width),
    snapshots,
    interactions,
    reducedMotion,
    offlineFallback,
    errors,
  };
}

async function measurePage(page, width) {
  return page.evaluate((viewportWidth) => {
    const root = document.documentElement;
    const body = document.body;
    return {
      width: viewportWidth,
      rootHeight: root.scrollHeight,
      bodyClientWidth: root.clientWidth,
      bodyScrollWidth: Math.max(root.scrollWidth, body.scrollWidth),
      domCount: document.querySelectorAll("*").length,
      firstStableRenderMs: Math.round(performance.now()),
    };
  }, width);
}

export async function runInteractions(page, interactions = []) {
  const results = [];
  for (const interaction of interactions) {
    const result = await page.evaluate(
      async ({ name, selectors }) => {
        const stateElement = document.querySelector("[data-viz-state]");
        const readState = () => {
          if (!stateElement) return "";
          const attributeValue = stateElement.getAttribute("data-viz-state");
          return (attributeValue || stateElement.textContent || "").trim();
        };
        const before = readState();
        let hook = null;
        for (const selector of selectors) {
          hook = document.querySelector(selector);
          if (hook) break;
        }
        if (!hook) {
          return {
            interaction: name,
            ok: false,
            error: "no-hook",
            before,
            after: readState(),
          };
        }
        if (typeof hook.click === "function") {
          hook.click();
        } else {
          hook.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            }),
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 40));
        const after = readState();
        return {
          interaction: name,
          ok: after !== before,
          before,
          after,
          error: after !== before ? null : "state-unchanged",
        };
      },
      { name: interaction, selectors: interactionSelectors(interaction) },
    );
    results.push(result);
  }
  return results;
}

export async function checkReducedMotion(browser, inputUrl) {
  const page = await browser.newPage();
  try {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/*", (route) =>
      route.request().url() === inputUrl
        ? route.continue()
        : route.abort("blockedbyclient"),
    );
    await page.goto(inputUrl, { waitUntil: "load" });
    const result = await page.evaluate(() => {
      const indicator = document.querySelector("[data-viz-motion]");
      return {
        mediaMatches: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        reported: indicator ? (indicator.textContent ?? "").trim() : null,
      };
    });
    const ok =
      result.mediaMatches &&
      (result.reported === null || result.reported === "reduced");
    return {
      ok,
      mediaMatches: result.mediaMatches,
      reported: result.reported,
      error: ok ? null : "animation-not-reduced",
    };
  } finally {
    await page.close();
  }
}

export async function checkOfflineFallback(browser, { inputUrl, dependencies = [] }) {
  const declaredUrls = dependencies
    .map((item) => item?.url)
    .filter((url) => typeof url === "string");
  if (declaredUrls.length === 0) {
    return { ok: true, skipped: true, dependencies: [] };
  }
  if (!browser) {
    throw new Error("browser is required for the offline fallback check");
  }
  const page = await browser.newPage();
  try {
    await page.route("**/*", async (route) => {
      if (route.request().url() === inputUrl) {
        await route.continue();
      } else {
        await route.abort("blockedbyclient");
      }
    });
    await page.goto(inputUrl, { waitUntil: "load" });
    const result = await page.evaluate(() => {
      const fallback = document.querySelector("[data-viz-fallback]");
      if (!fallback) {
        return { visible: false, error: "no-fallback-hook", text: "" };
      }
      const style = getComputedStyle(fallback);
      const visible =
        !fallback.hidden &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        (fallback.textContent ?? "").trim() !== "";
      return {
        visible,
        error: visible ? null : "fallback-not-visible",
        text: (fallback.textContent ?? "").trim().slice(0, 120),
      };
    });
    return {
      ok: result.visible,
      skipped: false,
      dependencies: declaredUrls,
      ...result,
    };
  } finally {
    await page.close();
  }
}

export async function renderHtmlFile({
  input,
  outputDir,
  widths = DEFAULT_WIDTHS,
  chromePath = discoverChrome(),
  dependencies = [],
  interactions = [],
  launch = (options) => chromium.launch(options),
  settleDelayMs = 120,
}) {
  if (!chromePath) {
    throw new Error("No executable system Chrome or Chromium was found");
  }
  await access(input, fsConstants.R_OK);
  await mkdir(outputDir, { recursive: true });
  const inputUrl = pathToFileURL(resolve(input)).href;
  const viewports = normalizeWidths(widths);
  const allowedUrls = dependencies
    .map((item) => item?.url)
    .filter((url) => typeof url === "string");
  const browser = await launch({ executablePath: chromePath, headless: true });
  const consoleErrors = [];
  const pageErrors = [];
  const requestErrors = [];
  const snapshots = [];
  try {
    const page = await browser.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => {
      if (!isAllowedRenderRequest(request.url(), inputUrl, allowedUrls)) {
        requestErrors.push(
          `${request.url()}: ${request.failure()?.errorText ?? "failed"}`,
        );
      }
    });
    await page.route("**/*", async (route) => {
      if (isAllowedRenderRequest(route.request().url(), inputUrl, allowedUrls)) {
        await route.continue();
      } else {
        requestErrors.push(`blocked external request: ${route.request().url()}`);
        await route.abort("blockedbyclient");
      }
    });
    for (const width of viewports) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(inputUrl, { waitUntil: "load" });
      await new Promise((resolve) => setTimeout(resolve, settleDelayMs));
      const measurement = await measurePage(page, width);
      const snapshot = analyzeSnapshot(measurement);
      const screenshot = resolve(
        outputDir,
        `${basename(input, ".html")}-${width}.png`,
      );
      await page.screenshot({ path: screenshot, fullPage: true });
      snapshots.push({ ...snapshot, screenshot });
    }
    const interactionResults = await runInteractions(page, interactions);
    const reducedMotion = await checkReducedMotion(browser, inputUrl);
    const offlineFallback = await checkOfflineFallback(browser, {
      inputUrl,
      dependencies,
    });
    const report = buildRenderReport({
      input,
      chromePath,
      snapshots,
      interactions: interactionResults,
      reducedMotion,
      offlineFallback,
      consoleErrors,
      pageErrors,
      requestErrors,
    });
    const reportPath = resolve(outputDir, "report.json");
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    return { ...report, reportPath };
  } finally {
    await browser.close();
  }
}
