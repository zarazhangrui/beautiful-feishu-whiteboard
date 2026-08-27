import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const skill = await readFile(new URL("../SKILL.md", import.meta.url), "utf8");
const htmlRules = await readFile(
  new URL("../HTML5_RULES.md", import.meta.url),
  "utf8",
);
const evals = JSON.parse(
  await readFile(new URL("../evals/evals.json", import.meta.url), "utf8"),
);

test("defines positive, negative and dual routing evals", () => {
  assert.ok(evals.some(({ expected_route: route }) => route === "whiteboard"));
  assert.ok(evals.some(({ expected_route: route }) => route === "html5-block"));
  assert.ok(evals.some(({ expected_route: route }) => route === "dual"));
  assert.ok(evals.some(({ expected_route: route }) => route === "not-triggered"));
});

test("routes explicit whiteboard and editable requests to whiteboard", () => {
  assert.ok(
    evals.some(
      (item) =>
        item.expected_route === "whiteboard" &&
        /可编辑|editable/.test(item.prompt),
    ),
  );
});

test("routes explicit Feishu HTML Block, interactive, dashboard, prototype, filter and animation requests to HTML", () => {
  for (const keyword of ["HTML Block", "interactive", "Dashboard", "原型", "筛选", "动画"]) {
    assert.ok(
      evals.some(
        (item) =>
          item.expected_route === "html5-block" &&
          item.prompt.includes(keyword),
      ),
      `missing html5-block eval for ${keyword}`,
    );
  }
});

test("dual requests share one VisualizationSpec and use two renderers", () => {
  assert.ok(evals.some((item) => item.expected_route === "dual"));
  assert.match(skill, /VisualizationSpec/);
  assert.match(skill, /one shared|共享.*语义|同一份|一份/);
  assert.match(skill, /dual|双发|两个.*渲染|双渲染/i);
});

test("ambiguous diagram requests remain whiteboard by default", () => {
  assert.ok(
    evals.some(
      (item) =>
        item.expected_route === "whiteboard" &&
        /架构图|信息图|流程/.test(item.prompt),
    ),
  );
  assert.match(skill, /default.*whiteboard|whiteboard.*default|默认.*白板|白板.*默认/i);
});

test("ordinary website or dashboard tasks without Feishu context do not trigger", () => {
  assert.ok(
    evals.some(
      (item) =>
        item.expected_route === "not-triggered" &&
        /dashboard|网页|移动端原型/.test(item.prompt),
    ),
  );
  assert.match(skill, /ordinary websites|普通网页/i);
  assert.match(skill, /do not invoke|不要触发|不触发/i);
});

test("the skill and HTML rules describe the interactive pipeline and new commands", () => {
  assert.match(skill, /HTML5_RULES\.md/);
  assert.match(skill, /html5-build\.mjs/);
  assert.match(skill, /check-html5-block\.mjs/);
  assert.match(skill, /render-html5-block\.mjs/);
  assert.match(htmlRules, /interactive|交互/i);
  assert.match(htmlRules, /html5-build\.mjs/);
  assert.match(htmlRules, /check-html5-block\.mjs/);
  assert.match(htmlRules, /render-html5-block\.mjs/);
  assert.match(htmlRules, /visualization\.spec\.json/);
  assert.match(htmlRules, /visualization\.manifest\.json/);
});

test("obsolete static SVG wrapper language is gone from the HTML rules", () => {
  for (const stale of [
    "svg-to-html",
    "source-svg-sha256",
    "static HTML presentation",
    "HTML 版 SVG",
  ]) {
    assert.doesNotMatch(htmlRules, new RegExp(stale, "i"));
  }
});
