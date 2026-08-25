import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateVisualizationSpec } from "../scripts/lib/visualization-spec.mjs";

test("accepts a network spec with declared interactions", async () => {
  const value = JSON.parse(
    await readFile("test/fixtures/spec/network.valid.json", "utf8"),
  );
  assert.equal(validateVisualizationSpec(value).ok, true);
});

test("rejects duplicate node ids and dangling edges", async () => {
  const value = JSON.parse(
    await readFile("test/fixtures/spec/network.invalid.json", "utf8"),
  );
  const report = validateVisualizationSpec(value);
  assert.equal(report.ok, false);
  assert.deepEqual(
    report.violations.map((item) => item.code),
    ["duplicate-node-id", "dangling-edge"],
  );
});
