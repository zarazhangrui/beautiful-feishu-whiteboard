# HTML5 Block Output Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a desktop-first, safe SVG-to-HTML5-Block output path while preserving the existing SVG-to-editable-whiteboard behavior.

**Architecture:** Keep whiteboard and HTML media rules separate. Validate an HTML-targeted SVG with a parser-backed allowlist, wrap it into a self-contained accessible HTML document, verify it in a real system Chrome through `playwright-core`, then publish through version-gated `lark-cli docs` commands and fetch the block back for verification.

**Tech Stack:** Node.js 20+, ESM, Node test runner, `@xmldom/xmldom`, `playwright-core`, lark-cli docs v2.

---

### Task 1: Add the Node test harness and locked dependencies

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `test/fixtures/valid.svg`
- Create: `test/fixtures/unsafe-script.svg`
- Create: `test/fixtures/unsafe-url.svg`

**Step 1: Create the package manifest**

Define ESM, `node --test`, Node >=20, and dependencies on `@xmldom/xmldom` and `playwright-core`.

**Step 2: Install and lock dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and npm exits 0.

**Step 3: Verify the empty harness**

Run: `npm test`

Expected: exit 0 with no failing tests.

**Step 4: Commit**

```bash
git add package.json package-lock.json test/fixtures
git commit -m "build: add html5 block test harness"
```

### Task 2: Implement parser-backed SVG policy validation

**Files:**
- Create: `test/svg-policy.test.mjs`
- Create: `scripts/lib/svg-policy.mjs`

**Step 1: Write failing allowlist tests**

Cover:

- valid native-shape SVG passes;
- `marker-end="url(#arrow)"` passes;
- missing/invalid `viewBox` fails;
- `<script>`, `<style>`, `<foreignObject>`, `<image>` fail;
- HTTP(S), `data:`, `javascript:`, event attributes and external entities fail;
- paths are allowed only below `<marker>`;
- excessive aspect ratio fails;
- estimated text size below the configured threshold fails.

**Step 2: Run tests to verify RED**

Run: `node --test test/svg-policy.test.mjs`

Expected: FAIL because `scripts/lib/svg-policy.mjs` does not exist.

**Step 3: Implement the minimal validator**

Export:

```js
validateSvg(svgText, {
  minSupportedWidth,
  minBodyFontSize,
  minSecondaryFontSize,
  maxAspectRatio
})
```

Return parsed metrics on success and throw a structured `SvgPolicyError` containing all violations on failure. Use `@xmldom/xmldom`; do not evaluate scripts or load resources.

**Step 4: Run tests to verify GREEN**

Run: `node --test test/svg-policy.test.mjs`

Expected: all policy tests pass.

**Step 5: Run the full suite**

Run: `npm test`

Expected: all tests pass.

**Step 6: Commit**

```bash
git add test/svg-policy.test.mjs scripts/lib/svg-policy.mjs
git commit -m "feat: validate html-targeted SVGs"
```

### Task 3: Implement deterministic SVG-to-HTML wrapping

**Files:**
- Create: `test/svg-to-html.test.mjs`
- Create: `scripts/lib/html-wrapper.mjs`
- Create: `scripts/svg-to-html.mjs`

**Step 1: Write failing wrapper tests**

Cover:

- required iframe/height/description meta;
- stable `artifact-id`;
- `source-svg-sha256`;
- accessible `<title>`, `<desc>`, `role="img"` and `aria-labelledby`;
- system font stack and `svg text` inheritance;
- supported-width layout and narrow-width horizontal-scroll fallback;
- strict CSP compatible with the static wrapper;
- inline SVG preserved without geometry rewrites;
- invalid SVG rejected through the policy validator;
- output size limit enforced.

**Step 2: Run tests to verify RED**

Run: `node --test test/svg-to-html.test.mjs`

Expected: FAIL because the wrapper module does not exist.

**Step 3: Implement the minimal library and CLI**

Library API:

```js
buildHtmlDocument({
  svg,
  title,
  description,
  artifactId,
  minSupportedWidth,
  maxBytes
})
```

CLI:

```bash
node scripts/svg-to-html.mjs \
  --input diagram.svg \
  --output widget.html \
  --title "..." \
  --description "..." \
  --artifact-id "..."
```

Write files atomically and refuse to overwrite unless `--force` is explicit.

**Step 4: Run tests to verify GREEN**

Run: `node --test test/svg-to-html.test.mjs`

Expected: all wrapper tests pass.

**Step 5: Exercise the CLI**

Run:

```bash
node scripts/svg-to-html.mjs \
  --input test/fixtures/valid.svg \
  --output /tmp/html5-block-widget.html \
  --title "HTML5 Block Test" \
  --description "A safe SVG wrapper test" \
  --artifact-id "html5-block-test"
```

Expected: JSON summary containing output path, byte size and SHA-256.

**Step 6: Commit**

```bash
git add test/svg-to-html.test.mjs scripts/lib/html-wrapper.mjs scripts/svg-to-html.mjs
git commit -m "feat: wrap SVG as accessible HTML5 block"
```

### Task 4: Implement HTML artifact verification

**Files:**
- Create: `test/check-html5-block.test.mjs`
- Create: `scripts/lib/html-check.mjs`
- Create: `scripts/check-html5-block.mjs`

**Step 1: Write failing tests**

Cover required meta, artifact/source hashes, CSP, no external resources, exactly one target SVG, maximum bytes and normalized-content hash behavior.

**Step 2: Run tests to verify RED**

Run: `node --test test/check-html5-block.test.mjs`

Expected: FAIL because the checker does not exist.

**Step 3: Implement the checker and CLI**

The CLI reads an HTML file and emits a JSON report. It returns non-zero on structural or policy violations.

**Step 4: Run tests to verify GREEN**

Run: `node --test test/check-html5-block.test.mjs`

Expected: all checker tests pass.

**Step 5: Commit**

```bash
git add test/check-html5-block.test.mjs scripts/lib/html-check.mjs scripts/check-html5-block.mjs
git commit -m "feat: verify HTML5 block artifacts"
```

### Task 5: Add real-browser rendering verification

**Files:**
- Create: `test/browser-render.test.mjs`
- Create: `scripts/lib/browser-render.mjs`
- Create: `scripts/render-html5-block.mjs`

**Step 1: Write failing unit tests**

Test Chrome discovery, viewport configuration, output report schema and minimum text-size violation calculation. Keep the browser launcher injectable; do not mock the document analysis logic.

**Step 2: Run tests to verify RED**

Run: `node --test test/browser-render.test.mjs`

Expected: FAIL because the renderer does not exist.

**Step 3: Implement the minimal renderer**

Use `playwright-core` with system Chrome/Chromium. Block all non-file network requests, capture console/page/request errors, render at configured minimum/typical/maximum widths, take full-page screenshots, inspect `<text>/<tspan>` actual screen bounds and verify narrow-width overflow behavior.

**Step 4: Run tests to verify GREEN**

Run: `node --test test/browser-render.test.mjs`

Expected: unit tests pass.

**Step 5: Run the real Chrome integration**

Run:

```bash
node scripts/render-html5-block.mjs \
  --input /tmp/html5-block-widget.html \
  --output-dir /tmp/html5-block-render \
  --widths 720,820,1000 \
  --narrow-width 600
```

Expected: screenshots and a JSON report with no console, page, network, clipping or text-size errors.

**Step 6: Commit**

```bash
git add test/browser-render.test.mjs scripts/lib/browser-render.mjs scripts/render-html5-block.mjs
git commit -m "feat: render and inspect HTML5 blocks"
```

### Task 6: Extend preflight without regressing whiteboard mode

**Files:**
- Create: `test/preflight.test.mjs`
- Create: `scripts/preflight-html5-block.mjs`
- Modify: `scripts/preflight.sh`

**Step 1: Write failing tests**

Test:

- default/whiteboard mode retains current checks;
- HTML mode detects Node dependencies, Chrome, lark-cli and minimum version;
- unsupported CLI version produces an actionable upgrade message;
- missing Chrome marks publishing unavailable;
- invalid `--mode` fails.

**Step 2: Run tests to verify RED**

Run: `node --test test/preflight.test.mjs`

Expected: FAIL because HTML preflight does not exist.

**Step 3: Implement HTML preflight and shell routing**

Add `scripts/preflight.sh --mode whiteboard|html5-block`; default remains whiteboard. Delegate deterministic HTML checks to the Node module.

**Step 4: Run tests to verify GREEN**

Run: `node --test test/preflight.test.mjs`

Expected: all preflight tests pass.

**Step 5: Verify current CLI behavior**

Run: `bash scripts/preflight.sh --mode html5-block`

Expected in the current environment: non-zero with an explicit message that lark-cli 1.0.46 is below the POC-supported version until that version is established.

**Step 6: Verify whiteboard regression**

Run: `bash scripts/preflight.sh --mode whiteboard`

Expected: existing whiteboard prerequisite behavior remains intact.

**Step 7: Commit**

```bash
git add test/preflight.test.mjs scripts/preflight-html5-block.mjs scripts/preflight.sh
git commit -m "feat: add HTML5 block preflight"
```

### Task 7: Run and record the lark-cli transport POC

**Files:**
- Create: `examples/html5-block/POC.md`
- Create: `examples/html5-block/example.svg`
- Create: `examples/html5-block/example.html`
- Create: `examples/html5-block/example.png`

**Step 1: Upgrade or obtain a CLI version with released HTML5 Block support**

Record exact CLI and bundled skill versions. Do not assume current main-branch documentation is released.

**Step 2: Verify path expansion with dry-run**

Expected: local HTML is represented through the supported request/reference-map mechanism, not sent as an unresolved local path.

**Step 3: Request confirmation before creating a real Feishu document**

Show the exact create/update targets and commands. Do not publish until confirmed.

**Step 4: Test create, fetch, insert, replace and mixed blocks**

Use observed revisions for updates. Record warnings/tips, new block IDs, `artifact-id`, normalized hash results, ambiguous-write behavior and actual Web/desktop widths.

**Step 5: Record browser and client screenshots**

Measure minimum/typical/maximum widths and tune defaults in tests/config.

**Step 6: Commit**

```bash
git add examples/html5-block
git commit -m "test: document HTML5 block transport POC"
```

### Task 8: Add media-specific rules and skill routing

**Files:**
- Create: `RULES-html5-block.md`
- Modify: `SKILL.md`
- Create: `evals/evals.json`

**Step 1: Write routing eval cases**

Include positive Feishu HTML5 Block requests, whiteboard defaults, arbitrary web/dashboard near-misses and dual-output requests.

**Step 2: Update rules and SKILL.md**

Keep `RULES.md` whiteboard-only. Route HTML only when the request explicitly involves Feishu/Lark HTML5 Block. Read exactly one medium-rules file after routing.

**Step 3: Validate the skill structure**

Run the available skill validation command or, if none exists, verify frontmatter, links and referenced files with repository tests.

**Step 4: Commit**

```bash
git add RULES-html5-block.md SKILL.md evals/evals.json
git commit -m "feat: route Feishu HTML5 block output"
```

### Task 9: Update documentation and run final verification

**Files:**
- Modify: `README.md`
- Modify: `README.zh.md`
- Modify: `DESIGN-html5-block-mode.md`

**Step 1: Document the experimental capability**

Explain editable whiteboard vs non-editable HTML5 Block, supported widths, narrow fallback, dependencies, security limits and delivery artifacts.

**Step 2: Run all automated tests**

Run: `npm test`

Expected: all tests pass with no warnings.

**Step 3: Run static and browser example verification**

Run the wrapper, checker and renderer against `examples/html5-block/example.svg`.

Expected: all tools exit 0 and screenshots are produced.

**Step 4: Verify repository state**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and only intended files changed.

**Step 5: Commit**

```bash
git add README.md README.zh.md DESIGN-html5-block-mode.md
git commit -m "docs: document HTML5 block output mode"
```
