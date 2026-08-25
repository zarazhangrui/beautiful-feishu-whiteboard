# Interactive HTML5 Renderer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the static SVG-wrapper HTML route with a shared `VisualizationSpec` and a secure, responsive, interactive HTML5 Block renderer while preserving the existing editable-whiteboard route.

**Architecture:** A JSON `VisualizationSpec` and theme tokens form the medium-independent contract. Whiteboard output continues to use the existing SVG pipeline; HTML output accepts a complete DOM/CSS/JavaScript page, validates it against declared capabilities and a version-pinned CDN allowlist, emits an external manifest, renders it at 390/820/1440px, then publishes and fetch-verifies the final HTML5 Block.

**Tech Stack:** Node.js 20 ESM, JSON Schema/Ajv, parse5, Acorn + acorn-walk, css-tree, Playwright Core + system Chrome, Node test runner, lark-cli.

---

## Preconditions

- Work in `/private/tmp/beautiful-feishu-whiteboard-html5-block-mode` on branch `codex/html5-block-mode`.
- Read `DESIGN-html5-block-mode.md`, `RULES.md`, and the current HTML scripts before editing.
- Use `@test-driven-development` for every behavior change and `@verification-before-completion` before claiming completion.
- Do not change existing whiteboard rendering or publishing behavior.
- Do not publish POC artifacts until all local gates pass.

### Task 1: Add the VisualizationSpec contract

**Files:**
- Create: `schemas/visualization-spec.schema.json`
- Create: `scripts/lib/visualization-spec.mjs`
- Create: `test/visualization-spec.test.mjs`
- Create: `test/fixtures/spec/network.valid.json`
- Create: `test/fixtures/spec/network.invalid.json`
- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Add the failing contract tests**

Test these exact behaviors:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateVisualizationSpec } from "../scripts/lib/visualization-spec.mjs";

test("accepts a network spec with declared interactions", async () => {
  const value = JSON.parse(await readFile("test/fixtures/spec/network.valid.json", "utf8"));
  assert.equal(validateVisualizationSpec(value).ok, true);
});

test("rejects duplicate node ids and dangling edges", async () => {
  const value = JSON.parse(await readFile("test/fixtures/spec/network.invalid.json", "utf8"));
  const report = validateVisualizationSpec(value);
  assert.equal(report.ok, false);
  assert.deepEqual(report.violations.map((item) => item.code), [
    "duplicate-node-id",
    "dangling-edge",
  ]);
});
```

The valid fixture must include title, summary, nodes, edges, a palette, `select/filter/pan/zoom`, alt text, and interaction instructions. The invalid fixture must include one duplicate node ID and one edge whose target is absent.

**Step 2: Run the tests and verify failure**

Run: `node --test test/visualization-spec.test.mjs`

Expected: FAIL because `scripts/lib/visualization-spec.mjs` does not exist.

**Step 3: Add schema tooling**

Run: `npm install ajv@8.17.1`

Expected: `package.json` and `package-lock.json` contain the exact Ajv version.

**Step 4: Implement the schema and semantic validator**

The schema must:

- Require `version`, `type`, `title`, `summary`, `content`, `theme`, `interactions`, and `accessibility`.
- Allow the approved types: `dashboard`, `chart`, `network`, `flow`, `timeline`, `presentation`, `prototype`, `form`, `knowledge-tool`, and `immersive`.
- Define typed node, edge, metric, series, step, and annotation arrays.
- Reject unknown top-level keys.

`validateVisualizationSpec(value)` must return `{ ok, violations }`, with stable codes for schema errors, duplicate IDs, dangling edges, duplicate step IDs, and unsupported interaction/type combinations.

**Step 5: Run the focused tests**

Run: `node --test test/visualization-spec.test.mjs`

Expected: PASS.

**Step 6: Commit**

```bash
git add package.json package-lock.json schemas scripts/lib/visualization-spec.mjs test/visualization-spec.test.mjs test/fixtures/spec
git commit -m "feat: add shared visualization spec contract"
```

### Task 2: Add theme tokens, dependency policy, and external manifest

**Files:**
- Create: `html5/dependencies.json`
- Create: `html5/theme-token-map.json`
- Create: `scripts/lib/html5-manifest.mjs`
- Create: `test/html5-manifest.test.mjs`
- Test: `templates/*/design.md`

**Step 1: Write failing dependency and manifest tests**

Cover:

```js
test("discovers only exact allowlisted dependency URLs", async () => {
  const result = await buildManifest({
    html: '<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>',
    spec,
    heightMode: "auto",
  });
  assert.deepEqual(result.dependencies.map((item) => item.id), ["echarts@5.5.1"]);
});

test("rejects unversioned or undeclared CDN scripts", async () => {
  await assert.rejects(
    () => buildManifest({ html: '<script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>', spec }),
    /dependency-not-allowlisted/,
  );
});

test("hashes the final HTML outside the HTML document", async () => {
  const manifest = await buildManifest({ html: "<!doctype html><html>...</html>", spec });
  assert.match(manifest.html.sha256, /^[a-f0-9]{64}$/);
  assert.equal(manifest.html.sha256, sha256("<!doctype html><html>...</html>"));
});
```

Also assert that every `CATALOG.md` palette has a CSS token mapping containing background, foreground, card, muted, primary, border, success, warning, error, radius, and shadow tokens.

**Step 2: Verify failure**

Run: `node --test test/html5-manifest.test.mjs`

Expected: FAIL because the policy and builder do not exist.

**Step 3: Add allowlist and theme map**

Pin exact URLs for the approved initial libraries. Start with only the dependencies needed by the three POC examples; add others only with a fixture and test. Do not add wildcard origins.

**Step 4: Implement manifest creation**

Export:

```js
export async function buildHtml5Manifest({ html, spec, heightMode, validation = {} })
export function verifyManifest({ html, spec, manifest })
export function resolveAllowedDependency(url)
```

The manifest must contain protocol version, type, height mode, dependencies, interactions, browser targets, byte length, SHA-256, and validation status. `verifyManifest` must recompute all derived fields from the passed files.

**Step 5: Run tests**

Run: `node --test test/html5-manifest.test.mjs`

Expected: PASS.

**Step 6: Commit**

```bash
git add html5/dependencies.json html5/theme-token-map.json scripts/lib/html5-manifest.mjs test/html5-manifest.test.mjs
git commit -m "feat: add HTML dependency and manifest policy"
```

### Task 3: Replace the static SVG checker with an HTML5/JS/CSS policy

**Files:**
- Modify: `scripts/lib/html-check.mjs`
- Create: `scripts/lib/javascript-policy.mjs`
- Create: `scripts/lib/css-policy.mjs`
- Modify: `scripts/lib/svg-policy.mjs`
- Modify: `test/check-html5-block.test.mjs`
- Create: `test/javascript-policy.test.mjs`
- Create: `test/css-policy.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Write failing safe-page and adversarial tests**

The safe fixture must include semantic HTML, responsive CSS, inline JavaScript state, one declared CDN dependency, and an interactive SVG subtree.

Required attack regressions:

- Namespaced fake required meta.
- `name` plus `http-equiv=refresh` on one meta.
- Extra style block with `image-set(https://...)`.
- CSS-escaped remote URL.
- SVG `fill`, `stroke`, or `marker-*` CSS escape to a remote URL.
- `eval`, `new Function`, dynamic script injection, `window.open`, `top`, and `parent`.
- Undeclared `fetch`, XHR, WebSocket, Beacon, form action, and navigation.
- CDATA and entity variants.

Example assertion:

```js
test("rejects delayed meta refresh even when name is present", () => {
  const html = validHtml.replace(
    "</head>",
    '<meta name="description" content="x" http-equiv="refresh"></head>',
  );
  assert.throws(() => checkHtml5Block(html, context), (error) =>
    error.violations.some((item) => item.code === "forbidden-meta"),
  );
});
```

**Step 2: Verify tests fail for the intended reasons**

Run: `node --test test/check-html5-block.test.mjs test/javascript-policy.test.mjs test/css-policy.test.mjs`

Expected: FAIL because current policy forbids all scripts and uses the old static wrapper contract.

**Step 3: Install parsers**

Run: `npm install parse5@7.3.0 acorn@8.15.0 acorn-walk@8.3.4 css-tree@3.1.0`

Expected: lockfile pins the exact versions.

**Step 4: Implement HTML5 parsing and exact metadata variants**

Replace xmldom HTML parsing with parse5. Required metadata:

- UTF-8 charset.
- viewport.
- `use-iframe=true`.
- `html-box-height-mode=auto|viewport` matching the Manifest.
- description.
- generated CSP.

Required meta nodes must be direct children of the single HTML `head`. Charset, named, and CSP variants must have mutually exclusive exact attribute sets. Reject refresh and unknown `http-equiv`.

**Step 5: Implement JavaScript AST policy**

Parse every inline script with Acorn and inspect with acorn-walk. Allow ordinary event listeners, DOM selection, state, animation, SVG/Canvas drawing, timers, `ResizeObserver`, and declared library globals. Reject dynamic code, dynamic script construction, navigation/window escape, undeclared network calls, secret-like literals, and unsafe HTML sinks containing user data.

**Step 6: Implement CSS AST and SVG subtree policy**

Use css-tree to inspect every stylesheet and style attribute. Resolve escaped identifiers/strings before URL decisions. Allow only local fragments, data URLs permitted by policy, and exact manifest dependencies. Retain the strongest existing SVG URL and namespace checks but remove the requirement that the page contain exactly one source SVG.

**Step 7: Run focused security tests**

Run: `node --test test/check-html5-block.test.mjs test/javascript-policy.test.mjs test/css-policy.test.mjs test/svg-policy.test.mjs`

Expected: PASS.

**Step 8: Commit**

```bash
git add package.json package-lock.json scripts/lib/html-check.mjs scripts/lib/javascript-policy.mjs scripts/lib/css-policy.mjs scripts/lib/svg-policy.mjs test
git commit -m "feat: validate interactive HTML5 artifacts"
```

### Task 4: Replace SVG wrapping with complete-page build and check CLIs

**Files:**
- Create: `scripts/html5-build.mjs`
- Modify: `scripts/check-html5-block.mjs`
- Delete: `scripts/svg-to-html.mjs`
- Delete: `scripts/lib/html-wrapper.mjs`
- Delete: `scripts/lib/html-template.mjs`
- Delete: `scripts/lib/svg-canonical.mjs`
- Delete: `test/svg-to-html.test.mjs`
- Create: `test/html5-build.test.mjs`
- Modify: `test/check-html5-block.test.mjs`

**Step 1: Write failing CLI tests**

Test the public interface:

```text
node scripts/html5-build.mjs \
  --spec visualization.spec.json \
  --input page.source.html \
  --output-dir dist/example

node scripts/check-html5-block.mjs \
  --spec dist/example/visualization.spec.json \
  --manifest dist/example/visualization.manifest.json \
  --input dist/example/index.html
```

Assert that build emits exactly the spec copy, external manifest, and `index.html`; the manifest hash equals the emitted HTML; rebuilding identical inputs is deterministic; changing text, geometry, script, dependency, or height mode without rebuilding the manifest fails check.

**Step 2: Verify failure**

Run: `node --test test/html5-build.test.mjs test/check-html5-block.test.mjs`

Expected: FAIL because the new CLI does not exist and the old CLI requires a source SVG.

**Step 3: Implement the minimal build CLI**

The builder must parse arguments, validate the spec and HTML, derive dependencies, generate CSP and required metadata deterministically, serialize the final HTML, then create the external Manifest from those final bytes. It must not invent UI or silently repair unsafe code.

**Step 4: Update the check CLI**

Remove `--source-svg` and `--source-sha256`. Require spec, manifest, and final HTML. Return a JSON report with protocol, dependencies, declared interactions, bytes, hash, and violations.

**Step 5: Remove the obsolete wrapper implementation**

Delete only files no longer imported. Keep reusable browser, publishing, and SVG-subtree policy code.

**Step 6: Run focused tests and repository search**

Run: `node --test test/html5-build.test.mjs test/check-html5-block.test.mjs`

Run: `rg "svg-to-html|source-svg-sha256|html-wrapper|static HTML" scripts test SKILL.md RULES-html5-block.md`

Expected: tests PASS; remaining matches are only migration documentation that will be updated in Task 7.

**Step 7: Commit**

```bash
git add scripts test package.json package-lock.json
git commit -m "refactor: build complete interactive HTML pages"
```

### Task 5: Expand browser verification to responsive interactions and offline fallback

**Files:**
- Modify: `scripts/lib/browser-render.mjs`
- Modify: `scripts/render-html5-block.mjs`
- Modify: `test/browser-render.test.mjs`
- Create: `test/fixtures/html/interactive-safe.html`

**Step 1: Write failing browser tests**

Tests must verify:

- 390, 820, and 1440px screenshots.
- No horizontal overflow or zero-height root.
- Console errors, page errors, failed requests, and undeclared requests fail.
- Manifest interactions map to stable hooks such as `[data-viz-action="zoom-in"]` and `[data-viz-filter]`.
- Clicking/selecting declared controls changes `[data-viz-state]` or the declared observable target.
- `prefers-reduced-motion` disables continuous animation.
- Blocking CDN origins displays `[data-viz-fallback]` instead of an empty canvas.

**Step 2: Verify failure**

Run: `node --test test/browser-render.test.mjs`

Expected: FAIL because the renderer currently checks only the static SVG wrapper.

**Step 3: Implement the renderer report**

Return one report containing per-viewport screenshot path, dimensions, overflow, root height, console/page/network failures, interaction results, reduced-motion result, offline fallback result, DOM count, and first-stable-render duration.

**Step 4: Update the CLI**

Require `--spec`, `--manifest`, `--input`, and `--output-dir`. Refuse to render when static check fails. Exit non-zero if any viewport or declared interaction fails.

**Step 5: Run focused tests**

Run: `node --test test/browser-render.test.mjs`

Expected: PASS with system Chrome; SKIP only when the explicit test fixture requests a missing-browser case.

**Step 6: Commit**

```bash
git add scripts/lib/browser-render.mjs scripts/render-html5-block.mjs test/browser-render.test.mjs test/fixtures/html
git commit -m "feat: verify responsive HTML interactions"
```

### Task 6: Add the three POC archetypes and examples

**Files:**
- Create: `html5/archetypes/network/README.md`
- Create: `html5/archetypes/dashboard/README.md`
- Create: `html5/archetypes/prototype/README.md`
- Create: `html5/examples/project-architecture/visualization.spec.json`
- Create: `html5/examples/project-architecture/page.source.html`
- Create: `html5/examples/dashboard/visualization.spec.json`
- Create: `html5/examples/dashboard/page.source.html`
- Create: `html5/examples/prototype/visualization.spec.json`
- Create: `html5/examples/prototype/page.source.html`
- Create: `test/html5-examples.test.mjs`

**Step 1: Write the failing example matrix test**

For every example, run spec validation, build, check, and browser render. Assert expected type, height mode, dependency IDs, and interactions.

For project architecture require `select`, `filter`, `pan`, and `zoom`; for Dashboard require a metric or series switch; for Prototype require local input/state and reset.

**Step 2: Verify failure**

Run: `node --test test/html5-examples.test.mjs`

Expected: FAIL because examples do not exist.

**Step 3: Implement the network example without shrinking a fixed canvas**

Use responsive DOM for the shell and an interactive SVG or Canvas for the graph. Include title, toolbar, graph, legend, detail panel, offline fallback, keyboard controls, reduced-motion handling, and stable `data-viz-*` test hooks.

**Step 4: Implement Dashboard and Prototype examples**

Use only allowlisted dependencies. Keep all example data local. Each page must remain useful if its optional CDN dependency fails.

**Step 5: Render and inspect all 820px screenshots**

Run: `node --test test/html5-examples.test.mjs`

Run the render CLI for each example and open the three 820px PNGs. Fix clipping, unreadable text, weak contrast, empty states, and misleading controls.

Expected: all automated tests PASS and visual inspection has no unresolved issue.

**Step 6: Commit**

```bash
git add html5/archetypes html5/examples test/html5-examples.test.mjs
git commit -m "feat: add interactive HTML visualization archetypes"
```

### Task 7: Update Skill routing, rules, preflight, and public documentation

**Files:**
- Modify: `SKILL.md`
- Rename: `RULES-html5-block.md` → `HTML5_RULES.md`
- Modify: `scripts/preflight.sh`
- Modify: `scripts/preflight-html5-block.mjs`
- Modify: `test/preflight.test.mjs`
- Modify: `test/skill-routing.test.mjs`
- Modify: `README.md`
- Modify: `README.zh.md`
- Modify: `examples/html5-block/POC.md`
- Delete: `examples/html5-block/example.svg`
- Replace: `examples/html5-block/example.html`

**Step 1: Write failing routing and preflight tests**

Assert:

- Explicit whiteboard/editable requests route to whiteboard.
- Explicit Feishu HTML Block, interactive, Dashboard, prototype, filter, or animation requests route to HTML.
- Dual requests require one shared spec and two renderers.
- Ambiguous diagram requests remain whiteboard by default.
- Ordinary website/Dashboard tasks without Feishu/Lark document context do not trigger the skill.
- HTML preflight checks Node, dependencies, system Chrome, lark-cli version, auth, and the new build/check/render commands.

**Step 2: Verify failure**

Run: `node --test test/skill-routing.test.mjs test/preflight.test.mjs`

Expected: FAIL on the static-SVG wording and old command checks.

**Step 3: Rewrite the skill and HTML rules**

Document the shared Spec, five HTML types, responsive/high-mode choice, dependency declaration, secure build/check/render/publish sequence, fetch verification, and the requirement to inspect 820px output. Preserve the existing whiteboard route text unless needed for shared Spec integration.

**Step 4: Update docs and examples**

Remove every claim that HTML is a static SVG presentation. Explain which block is editable and which is interactive. Keep ordinary front-end tasks out of scope.

**Step 5: Run focused tests and stale-language search**

Run: `node --test test/skill-routing.test.mjs test/preflight.test.mjs`

Run: `rg "separate SVG|static HTML|SVG wrapper|svg-to-html|850|1000" SKILL.md HTML5_RULES.md README.md README.zh.md examples scripts test`

Expected: tests PASS and no obsolete architectural instruction remains.

**Step 6: Commit**

```bash
git add SKILL.md HTML5_RULES.md README.md README.zh.md examples scripts/preflight.sh scripts/preflight-html5-block.mjs test
git commit -m "docs: route Feishu requests to interactive HTML"
```

### Task 8: Implement publishing and fetch verification for complete HTML artifacts

**Files:**
- Create: `scripts/html5-publish.mjs`
- Create: `scripts/lib/html5-fetch-verify.mjs`
- Create: `test/html5-publish.test.mjs`
- Modify: `examples/html5-block/poc-document.xml`

**Step 1: Write failing transport tests with a fake lark-cli**

Test create and fetch behavior without network:

- Publisher refuses unvalidated manifests.
- Generated DocxXML uses `<html5-block path="@./index.html"/>`.
- Dual mode places whiteboard and HTML blocks in deterministic order.
- Fetch verifier requires `data-ref` and matching `reference_map` entry.
- Exported server HTML is normalized and compared with local final HTML.
- Text/script/style/geometry/dependency mutation fails verification.
- Warnings or tips are surfaced and cause failure when they affect HTML rendering.

**Step 2: Verify failure**

Run: `node --test test/html5-publish.test.mjs`

Expected: FAIL because publisher and verifier do not exist.

**Step 3: Implement publisher and verifier**

Use `spawn`/`execFile`, never shell string interpolation. Default to `--as user`. Keep the first implementation create-only unless the existing update POC gates are now covered by tests. Return a JSON report containing document URL/token, block ID, revision, local hash, remote hash, and warnings.

**Step 4: Run focused tests**

Run: `node --test test/html5-publish.test.mjs`

Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/html5-publish.mjs scripts/lib/html5-fetch-verify.mjs test/html5-publish.test.mjs examples/html5-block/poc-document.xml
git commit -m "feat: publish and verify interactive HTML blocks"
```

### Task 9: Run the full local release candidate and publish the real POC

**Files:**
- Create: `examples/html5-block/POC-interactive.md`
- Modify only if validation finds defects: files from Tasks 1–8

**Step 1: Run the full local suite**

Run: `npm test`

Expected: all tests PASS; no unexpected SKIP.

**Step 2: Run static checks on all examples**

Run build and check for project architecture, Dashboard, and Prototype.

Expected: all reports have `ok: true`, exact dependency declarations, and matching hashes.

**Step 3: Run browser verification**

Render all three examples at 390/820/1440px, reduced motion, and CDN-blocked mode.

Expected: every declared interaction passes; no unexpected network, overflow, page error, console error, or blank fallback.

**Step 4: Inspect screenshots**

Open every 820px screenshot and the project architecture 390/1440px screenshots. Record the inspection result in `POC-interactive.md`.

**Step 5: Run preflight**

Run: `bash scripts/preflight.sh --mode html5-block`

Expected: PASS for Node, npm dependencies, browser, lark-cli version, and user auth.

**Step 6: Publish one dual-output Feishu document**

Use the project architecture Spec to produce:

- Existing editable whiteboard output.
- New interactive HTML network output.

Create one document containing both blocks. This is the first step that mutates external state; do it only after all preceding evidence is green.

**Step 7: Fetch and verify**

Run `lark-cli docs +fetch` through the publisher verifier. Confirm both blocks, exact HTML export hash, block height behavior, and warnings/tips.

**Step 8: Real-client smoke test**

Open the document in Feishu Web and one desktop client. Verify node select, filter, pan, zoom, full-screen view, adjacent whiteboard integrity, and readable 820px text.

**Step 9: Record POC evidence and commit**

```bash
git add examples/html5-block/POC-interactive.md
git commit -m "test: validate interactive HTML5 block POC"
```

### Task 10: Final regression and review

**Files:**
- Modify only files implicated by failures or review findings.

**Step 1: Run formatting and stale-reference checks**

Run: `git diff --check`

Run: `rg "svg-to-html|source-svg-sha256|static HTML presentation|HTML 版 SVG" . --glob '!DESIGN-html5-block-mode.md' --glob '!docs/plans/*'`

Expected: no unintended stale implementation references.

**Step 2: Run the full suite again**

Run: `npm test`

Expected: all tests PASS.

**Step 3: Run adversarial security fixtures directly**

Run the checker against every unsafe fixture and confirm each exits non-zero with the expected stable violation code.

**Step 4: Review branch diff**

Run: `git diff --stat 9afb4f0..HEAD`

Run: `git diff --check 9afb4f0..HEAD`

Confirm the whiteboard route has no behavior regression and obsolete wrapper files are gone.

**Step 5: Request code review**

Use `@requesting-code-review`. Treat all findings with `@receiving-code-review`, reproduce them, and fix Critical/Important issues before delivery.

**Step 6: Final verification commit if needed**

Commit only concrete fixes or evidence changes; do not create an empty completion commit.

