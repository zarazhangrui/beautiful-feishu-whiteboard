#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

import { discoverChrome } from "./lib/browser-render.mjs";

export const MIN_LARK_CLI_VERSION = "1.0.89";

export function compareVersions(left, right) {
  const a = String(left).split(".").map(Number);
  const b = String(right).split(".").map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return Math.sign(difference);
  }
  return 0;
}

export function checkHtml5Prerequisites({
  nodeVersion,
  dependenciesAvailable,
  chromePath,
  larkCliVersion,
  authenticated,
}) {
  const errors = [];
  const warnings = [];
  if (compareVersions(nodeVersion, "20.0.0") < 0) {
    errors.push(`Node ${nodeVersion} is unsupported; install Node 20 or newer`);
  }
  if (!dependenciesAvailable) {
    errors.push("Node dependencies are missing; run npm install in the skill directory");
  }
  if (!larkCliVersion) {
    errors.push("lark-cli is missing; install @larksuite/cli and authenticate it");
  } else if (compareVersions(larkCliVersion, MIN_LARK_CLI_VERSION) < 0) {
    errors.push(
      `lark-cli ${larkCliVersion} is below the verified HTML5 Block version ${MIN_LARK_CLI_VERSION}; run lark-cli update`,
    );
  }
  if (!authenticated) {
    errors.push("lark-cli user authentication is unavailable; run a scoped lark-cli auth login");
  }
  if (!chromePath) {
    errors.push("System Chrome/Chromium is required before publishing an HTML5 Block");
  }
  return {
    ok: errors.length === 0,
    publishAvailable: errors.length === 0,
    minimumLarkCliVersion: MIN_LARK_CLI_VERSION,
    detected: { nodeVersion, dependenciesAvailable, chromePath, larkCliVersion, authenticated },
    errors,
    warnings,
  };
}

function detectDependencies() {
  const require = createRequire(import.meta.url);
  try {
    require.resolve("@xmldom/xmldom");
    require.resolve("playwright-core");
    return true;
  } catch {
    return false;
  }
}

function detectLarkCliVersion() {
  try {
    const output = execFileSync("lark-cli", ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 10_000 });
    return output.match(/(\d+\.\d+\.\d+)/)?.[1] ?? null;
  } catch {
    return null;
  }
}

export function detectAuthentication(execute = execFileSync) {
  try {
    const output = execute("lark-cli", ["auth", "status"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 10_000,
    });
    const status = JSON.parse(output);
    return status?.identities?.user?.available === true;
  } catch {
    return false;
  }
}

export function detectHtml5Prerequisites() {
  return checkHtml5Prerequisites({
    nodeVersion: process.versions.node,
    dependenciesAvailable: detectDependencies(),
    chromePath: discoverChrome(),
    larkCliVersion: detectLarkCliVersion(),
    authenticated: detectAuthentication(),
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = detectHtml5Prerequisites();
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}
