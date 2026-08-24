import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const skill = await readFile(new URL("../SKILL.md", import.meta.url), "utf8");
const htmlRulesUrl = new URL("../RULES-html5-block.md", import.meta.url);
const evals = JSON.parse(await readFile(new URL("../evals/evals.json", import.meta.url), "utf8"));

test("defines positive, negative and dual routing evals", () => {
  assert.ok(evals.some(({ expected_route: route }) => route === "whiteboard"));
  assert.ok(evals.some(({ expected_route: route }) => route === "html5-block"));
  assert.ok(evals.some(({ expected_route: route }) => route === "dual"));
  assert.ok(evals.some(({ expected_route: route }) => route === "not-triggered"));
});

test("limits HTML triggering to explicit Feishu or Lark document context", () => {
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  assert.match(frontmatter, /HTML5 Block|HTML block/);
  assert.match(frontmatter, /Feishu|Lark/);
  assert.match(skill, /ordinary websites|普通网页/i);
  assert.match(skill, /do not invoke this skill/i);
});

test("routes whiteboard by default and supports explicit dual output", () => {
  assert.match(skill, /default.*whiteboard|whiteboard.*default|默认.*白板|白板.*默认/i);
  assert.match(skill, /dual/i);
  assert.match(skill, /html5-block/i);
  assert.match(skill, /<whiteboard[^>]*path=.*<html5-block[^>]*path=/s);
});

test("requires exactly the rule files selected by the output route", async () => {
  const htmlRules = await readFile(htmlRulesUrl, "utf8");
  assert.match(skill, /RULES-html5-block\.md/);
  assert.match(skill, /RULES\.md/);
  assert.match(skill, /read.*only|只读取/i);
  assert.match(htmlRules, /scripts\/svg-to-html\.mjs/);
  assert.match(htmlRules, /scripts\/check-html5-block\.mjs/);
  assert.match(htmlRules, /scripts\/render-html5-block\.mjs/);
});
