import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  MIN_LARK_CLI_VERSION,
  checkHtml5Prerequisites,
  compareVersions,
  detectAuthentication,
} from "../scripts/preflight-html5-block.mjs";

test("compares dotted CLI versions numerically", () => {
  assert.equal(compareVersions("1.0.89", "1.0.89"), 0);
  assert.equal(compareVersions("1.1.0", "1.0.89"), 1);
  assert.equal(compareVersions("1.0.46", "1.0.89"), -1);
});

test("accepts an HTML environment with dependencies, Chrome and supported CLI", () => {
  const report = checkHtml5Prerequisites({
    nodeVersion: "22.0.0",
    dependenciesAvailable: true,
    chromePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    larkCliVersion: MIN_LARK_CLI_VERSION,
    authenticated: true,
  });
  assert.equal(report.ok, true);
  assert.equal(report.publishAvailable, true);
});

test("rejects an unsupported CLI with an actionable upgrade message", () => {
  const report = checkHtml5Prerequisites({
    nodeVersion: "22.0.0",
    dependenciesAvailable: true,
    chromePath: "/chrome",
    larkCliVersion: "1.0.46",
    authenticated: true,
  });
  assert.equal(report.ok, false);
  assert.match(report.errors.join("\n"), /lark-cli update/);
  assert.match(report.errors.join("\n"), /1\.0\.89/);
});

test("marks publishing unavailable when Chrome is missing", () => {
  const report = checkHtml5Prerequisites({
    nodeVersion: "22.0.0",
    dependenciesAvailable: true,
    chromePath: null,
    larkCliVersion: MIN_LARK_CLI_VERSION,
    authenticated: true,
  });
  assert.equal(report.publishAvailable, false);
  assert.ok(report.errors.some((message) => message.includes("Chrome")));
});

test("detects user auth from captured status JSON instead of ignored stdout", () => {
  const authenticated = detectAuthentication((command, args, options) => {
    assert.equal(command, "lark-cli");
    assert.deepEqual(args, ["auth", "status"]);
    assert.deepEqual(options.stdio, ["ignore", "pipe", "pipe"]);
    return JSON.stringify({ identities: { user: { available: true, status: "ready" } } });
  });
  assert.equal(authenticated, true);
});

test("shell preflight rejects an invalid mode", () => {
  const result = spawnSync("bash", ["scripts/preflight.sh", "--mode", "invalid"], {
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /whiteboard\|html5-block/);
});

test("shell preflight defaults to the existing whiteboard checks", () => {
  const result = spawnSync("bash", ["scripts/preflight.sh", "--help"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /default: whiteboard/);
  assert.match(result.stdout, /whiteboard\|html5-block/);
});
