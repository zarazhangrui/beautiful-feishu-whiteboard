---
name: beautiful-feishu-whiteboard
version: 1.2.0
description: >
  Use when a user wants a polished Feishu / Lark whiteboard, infographic, diagram, poster, or visual
  explainer; requests a bundled colour style for a Feishu/Lark visual; explicitly asks to publish SVG
  as a Feishu/Lark document HTML5 Block or HTML block; or asks for both whiteboard and HTML5 Block
  outputs. Do not use for ordinary websites, web apps, or dashboards without explicit Feishu/Lark context.
---

# Beautiful Feishu Whiteboard

A 35-palette design system for SVG visuals published as an editable Feishu whiteboard, a static
Feishu HTML5 Block, or both. Content and visual language are shared; geometry is medium-specific.

## Route the output first

Choose one route before reading medium rules:

| User intent | Route |
|-|-|
| Explicitly asks for both a Feishu whiteboard and HTML5 Block | `dual` |
| Explicitly asks for a Feishu/Lark document HTML5 Block, HTML block, or SVG embedded as HTML | `html5-block` |
| Whiteboard, infographic, diagram, poster, visual explainer, or no explicit medium | `whiteboard` (default) |

For ordinary websites, web apps, or dashboards without explicit Feishu/Lark document context, do not invoke this skill or choose any route.

After routing, read only the selected medium rule file(s):

- `whiteboard` → [`RULES.md`](RULES.md)
- `html5-block` → [`RULES-html5-block.md`](RULES-html5-block.md)
- `dual` → both files; treat the outputs as two separate SVG layouts of the same content

## Common workflow

1. Understand the subject, audience, purpose, and required content. Ask only when a missing answer
   would materially change the result.
2. Ask for a visual vibe only if the user has not supplied one and choosing automatically would be
   surprising. Otherwise pick a fitting style from [`CATALOG.md`](CATALOG.md) and state the choice.
3. Read exactly one chosen [`templates/<slug>/design.md`](templates/) palette.
4. Build every requested medium according to its rule file. Keep facts, labels, hierarchy, palette,
   and visual tone aligned, but do not reuse whiteboard geometry for HTML when it would shrink text.
5. Render and inspect every artifact. Fix overflow, clipping, overlaps, weak contrast, and cramped
   padding before publishing.
6. Publish with `lark-cli` under the user identity, then fetch the document back and verify every
   requested resource block. A successful write response without fetch verification is incomplete.

## Route-specific delivery

### Whiteboard

Generate the 1600–1700-wide editable-board SVG, render/check it with whiteboard-cli, publish it as a
whiteboard, export the live preview, and inspect the preview.

### HTML5 Block

Generate a separate SVG for the measured document width, then run:

1. `scripts/svg-to-html.mjs`
2. `scripts/check-html5-block.mjs`
3. `scripts/render-html5-block.mjs`
4. `lark-cli docs +create` with `<html5-block path="@./...">`
5. `docs +fetch` and verify the `data-ref`, `reference_map`, artifact ID, and normalized hash

### Dual

Create one Feishu document containing both resource blocks. Use one shared content outline and
palette, a whiteboard SVG sized for editability, and an HTML SVG sized for document readability.
Verify both blocks independently after the write.

The experimental HTML route is create-only. Do not insert into or replace blocks in an existing
document until the remaining update, conflict, multi-block, and trusted-client POC gates are complete.

Use one combined DocxXML release candidate so block order is deterministic:

```xml
<title>Visual title</title>
<h1>可编辑飞书白板</h1>
<whiteboard type="svg" path="@./diagram-whiteboard.svg"></whiteboard>
<h1>HTML5 Block</h1>
<html5-block path="@./widget.html"></html5-block>
```

## Prerequisites

Run `bash scripts/preflight.sh --mode whiteboard` and/or
`bash scripts/preflight.sh --mode html5-block` for the selected route. HTML publishing requires the
verified `lark-cli` version, installed Node dependencies, user authentication, and system Chrome.

## Deliver

Return the Feishu document link and local rendered preview(s). State which block is editable and
which is a static HTML presentation. Offer palette changes without implying that the two layouts
must be pixel-identical.

## Files

- [`RULES.md`](RULES.md): editable-whiteboard medium rules
- [`RULES-html5-block.md`](RULES-html5-block.md): static HTML5 Block medium rules
- [`CATALOG.md`](CATALOG.md): style selection catalogue
- [`templates/`](templates/): palette definitions
- [`scripts/preflight.sh`](scripts/preflight.sh): route-aware prerequisite checks
