# Feishu HTML5 Block — Medium Rules

These rules apply only when the user explicitly requests a Feishu/Lark document HTML5 Block,
HTML block, or dual whiteboard + HTML output. `RULES.md` remains the editable-whiteboard contract.

## Shared semantics: VisualizationSpec

- The HTML route starts from a [`VisualizationSpec`](schemas/visualization-spec.schema.json):
  a JSON contract recording the title, summary, content (nodes, edges, metrics, series, steps,
  annotations), theme palette, declared interactions, and accessibility text. It never stores
  final coordinates or markup.
- For dual output, one shared spec drives both renderers: the whiteboard SVG and the interactive
  HTML page must keep facts, hierarchy, palette, and visual tone aligned. Layout, geometry, and
  HTML-only interactions may differ.
- Validate the spec with `scripts/check-html5-block.mjs`; the schema rejects unknown fields,
  duplicate ids, dangling references, and interactions the type does not support.

## Page contract

- Author a complete, responsive HTML page (`page.source.html`) with semantic DOM, inline CSS, and
  inline JavaScript. The SVG inside is optional: a network graph may use an interactive SVG, a
  dashboard may use plain HTML cards, and a prototype may use form controls.
- The builder injects the required metadata deterministically: `charset`, `viewport`, `use-iframe`,
  `html-box-height-mode`, `description` (from `spec.summary`), the generated CSP, and the title.
  Do not declare those reserved metas in the source page.
- Default `html-box-height-mode=auto` so the block expands in the document flow. `viewport` is for
  single-screen tools only and remains subject to the trusted-client POC gate.
- Primary acceptance widths are 390, 820, and 1440px; 820px is the main Feishu document width.
  Body text must stay readable (≥16px) at 820px. On very narrow screens, reflow columns or expose
  an internal horizontal scroll container; never shrink body text to fit.
- Declared interactions must be reachable through stable hooks the renderer verifies:
  `[data-viz-action="..."]`, `[data-viz-filter]`, `[data-viz-input]`, `[data-node-id]`,
  `[data-viz-selectable]`, and a `[data-viz-state]` element that reflects every state change.
- Include a `[data-viz-fallback]` element that becomes visible when an optional CDN dependency
  fails, and a `[data-viz-motion]` indicator reporting `full` or `reduced` from
  `prefers-reduced-motion`.
- Stop continuous animation when reduced motion is active; never rely on hover to reveal controls
  or hide core facts.

## Security boundary

- Default deny: no external resources except exact, version-pinned allowlist entries from
  [`html5/dependencies.json`](html5/dependencies.json). Every external script requires matching
  SRI `integrity` and `crossorigin="anonymous"`.
- Forbidden: `eval`, `new Function`, dynamic script/module loading, executable HTML sinks
  (`innerHTML` and friends), `window.open`, `top`/`parent` access, navigation, form submission,
  `fetch`/XHR/WebSocket/Beacon, storage, secrets, and remote fonts or images.
- CSS and SVG are parsed and checked: no `@import`, no external URLs, no `image-set`, no script or
  event attributes in SVG, no `foreignObject`, no external paint references, and no entity tricks.
- The generated CSP is a defense-in-depth layer; the static policy and real-browser pass remain
  the required gates. Never write access tokens, cookies, user identities, or document content
  into the HTML.
- One HTML artifact stays under 500KB. The Manifest records the final HTML hash and dependency
  list; the check and render steps refuse any drift between the Manifest and the HTML.

## Build and local verification

Run from the skill directory:

```bash
bash scripts/preflight.sh --mode html5-block

node scripts/html5-build.mjs \
  --spec html5/examples/project-architecture/visualization.spec.json \
  --input html5/examples/project-architecture/page.source.html \
  --output-dir dist/project-architecture

node scripts/check-html5-block.mjs \
  --spec dist/project-architecture/visualization.spec.json \
  --manifest dist/project-architecture/visualization.manifest.json \
  --input dist/project-architecture/index.html

node scripts/render-html5-block.mjs \
  --spec dist/project-architecture/visualization.spec.json \
  --manifest dist/project-architecture/visualization.manifest.json \
  --input dist/project-architecture/index.html \
  --output-dir dist/project-architecture/render
```

Keep the emitted `visualization.spec.json`, `visualization.manifest.json`, and `index.html`.
Inspect the 820px screenshot plus `render/report.json`; the renderer also verifies every declared
interaction, reduced motion, and the CDN-offline fallback. Publishing is blocked on policy, CSP,
console, page, network, overflow, zero-height, interaction, or narrow-layout failures.

Start from an archetype when the type fits:

- [`html5/archetypes/network/README.md`](html5/archetypes/network/README.md) — graphs and architecture
- [`html5/archetypes/dashboard/README.md`](html5/archetypes/dashboard/README.md) — KPI dashboards
- [`html5/archetypes/prototype/README.md`](html5/archetypes/prototype/README.md) — prototypes and forms

## Publish and fetch back

The verified minimum CLI is `lark-cli 1.0.89`; older versions lack the HTML5 Block DocxXML
contract. Use explicit user identity (`--as user`).

In a task-local directory, reference files relative to the XML file and CLI working directory:

```xml
<title>Document title</title>
<html5-block path="@./index.html"></html5-block>
```

```bash
lark-cli docs +create --doc-format xml --content @./document.xml --as user
lark-cli docs +fetch --doc DOC_TOKEN --detail full --as user
```

The experimental route creates a new document only. Inserting into or replacing blocks in an
existing document stays disabled until the remaining update, conflict, multi-block, and
trusted-client POC gates are complete. After creation, fetch again and verify:

- the body contains `<html5-block data-ref="...">`;
- `document.reference_map["html5-block"]` contains that key and its HTML data;
- structure and normalized content hash match the local artifact; record raw length only as a
  diagnostic because the service may normalize encoding or whitespace.

On an ambiguous timeout, fetch and inspect the result only when a document token was returned. If
no token was returned, stop and report that creation needs manual confirmation; never retry
automatically or blindly create a second copy.

## Deliverables

Keep the spec, generated HTML, Manifest, browser report, and representative PNGs. Tell the user
which block is an editable whiteboard and which is an interactive HTML block (interactive in the
browser, but not node-editable inside the doc).
