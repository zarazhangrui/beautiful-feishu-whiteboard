---
name: beautiful-feishu-whiteboard
version: 1.3.0
description: >
  Use when a user wants a polished Feishu / Lark whiteboard, infographic, diagram, poster, or visual
  explainer; requests a bundled colour style for a Feishu/Lark visual; explicitly asks to publish an
  interactive HTML5 Block / HTML block (Dashboard, prototype, filterable or animated visualization)
  into a Feishu/Lark document; or asks for both whiteboard and HTML5 Block outputs. Do not use for
  ordinary websites, web apps, or dashboards without explicit Feishu/Lark document context.
---

# Beautiful Feishu Whiteboard

A 35-palette design system that publishes visuals into Feishu/Lark documents in two forms: an
**editable SVG whiteboard** or an **interactive HTML5 Block** (or both). Content and visual tone are
shared through a `VisualizationSpec`; each medium renders it with its own rules.

## Route the output first

Choose one route before reading medium rules:

| User intent | Route |
|-|-|
| Whiteboard, board, editable diagram, poster, visual explainer, or no explicit medium | `whiteboard` (default) |
| Explicit Feishu/Lark document HTML5 Block, HTML block, interactive/Dashboard/prototype/filtered/animated visualization inside a Feishu doc | `html5-block` |
| Explicitly asks for both a Feishu whiteboard and an HTML5 Block | `dual` |

Only a Feishu/Lark document context triggers the HTML route. For ordinary websites, web apps, or
dashboards without explicit Feishu/Lark context, do not invoke this skill or choose any route.

After routing, read only the selected medium rule file(s):

- `whiteboard` → [`RULES.md`](RULES.md)
- `html5-block` → [`HTML5_RULES.md`](HTML5_RULES.md)
- `dual` → both files; build one shared `VisualizationSpec` and render each medium from it

## Common workflow

1. Understand the subject, audience, purpose, and required content. Ask only when a missing answer
   would materially change the result.
2. Ask for a visual vibe only if the user has not supplied one and choosing automatically would be
   surprising. Otherwise pick a fitting style from [`CATALOG.md`](CATALOG.md) and state the choice.
3. Read exactly one chosen [`templates/<slug>/design.md`](templates/) palette.
4. Build every requested medium according to its rule file. For dual output, author one
   `VisualizationSpec` first so facts, labels, hierarchy, palette, and tone stay aligned.
5. Render and inspect every artifact. Fix overflow, clipping, overlaps, weak contrast, and cramped
   padding before publishing.
6. Publish with `lark-cli` under the user identity, then fetch the document back and verify every
   requested resource block. A successful write response without fetch verification is incomplete.

## Route-specific delivery

### Whiteboard

Generate the 1600–1700-wide editable-board SVG, render/check it with whiteboard-cli, publish it as a
whiteboard, export the live preview, and inspect the preview.

### HTML5 Block

Author a complete responsive page for the chosen archetype, then run the verified pipeline:

Build the page as **one fixed canvas at the SVG's logical size** (typically 1600px wide). Do not
adapt it to document width — scale the whole stage uniformly to the container, and treat the
fullscreen button as the 1:1 reading mode.

1. `scripts/html5-build.mjs --spec ... --input ... --output-dir ...`
2. `scripts/check-html5-block.mjs --spec ... --manifest ... --input ...`
3. `scripts/render-html5-block.mjs --spec ... --manifest ... --input ... --output-dir ...`
4. `lark-cli docs +create` with `<html5-block path="@./index.html">`
5. `docs +fetch` and verify the `data-ref`, `reference_map`, and normalized hash

The HTML block is interactive in the browser (selection, filters, zoom, local state) but is not
node-editable inside the doc.

### Dual

Create one Feishu document containing both resource blocks: one `VisualizationSpec`, a whiteboard
SVG sized for editability, and an interactive HTML page on a fixed canvas at the same SVG size
(scaled to fit, fullscreen for 1:1). Verify both blocks independently after the write.

Use one combined DocxXML release candidate so block order is deterministic:

```xml
<title>Visual title</title>
<h1>可编辑飞书白板</h1>
<whiteboard type="svg" path="@./diagram-whiteboard.svg"></whiteboard>
<h1>HTML5 Block</h1>
<html5-block path="@./index.html"></html5-block>
```

The experimental HTML route is create-only. Do not insert into or replace blocks in an existing
document until the remaining update, conflict, multi-block, and trusted-client POC gates are complete.

## Prerequisites

Run `bash scripts/preflight.sh --mode whiteboard` and/or
`bash scripts/preflight.sh --mode html5-block` for the selected route. HTML publishing requires the
verified `lark-cli` version, installed Node dependencies, the build/check/render scripts, user
authentication, and system Chrome.

## Deliver

Return the Feishu document link and local rendered preview(s). State which block is editable and
which is interactive. Offer palette changes without implying that the two layouts must be
pixel-identical.

## Files

- [`RULES.md`](RULES.md): editable-whiteboard medium rules
- [`HTML5_RULES.md`](HTML5_RULES.md): interactive HTML5 Block medium rules
- [`CATALOG.md`](CATALOG.md): style selection catalogue
- [`templates/`](templates/): palette definitions
- [`schemas/visualization-spec.schema.json`](schemas/visualization-spec.schema.json): shared semantic contract
- [`html5/archetypes/`](html5/archetypes/): verified page skeletons
- [`html5/examples/`](html5/examples/): runnable example specs and pages
- [`scripts/preflight.sh`](scripts/preflight.sh): route-aware prerequisite checks
