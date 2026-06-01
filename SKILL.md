---
name: beautiful-feishu-whiteboard
version: 1.0.0
description: >
  A library of 24 curated colour-palette styles for building beautiful, editable Feishu / Lark
  (飞书) whiteboards from SVG. Use this whenever the user wants to create or draw a Feishu whiteboard,
  infographic, diagram, poster, or visual explainer and wants it to look polished / on-brand / in a
  particular aesthetic — or when they name a style (e.g. "neo-brutalist", "minimal editorial",
  "candy", "ceramic blue") or point at one of the templates. Each template is a colour palette + the
  whiteboard medium's hard rendering rules; the agent picks a palette, composes the layout itself
  with native shapes, renders and visually checks it, then writes it into a Feishu doc as an
  editable whiteboard. Requires lark-cli (npm @larksuite/cli) installed + authenticated and a
  Feishu/Lark account.
---

# Beautiful Feishu Whiteboard

A design-system skill: **24 colour-palette templates** + the verified **hard rules** of the Feishu
SVG whiteboard medium, so you can build gorgeous, on-brand, *editable* whiteboards.

This is **not** an auto-layout chart generator — **you** compose the layout. A template gives you a
**palette + mood**; [`RULES.md`](RULES.md) gives you the medium's hard limits. The board you produce
is a real, editable Feishu whiteboard (not a screenshot).

## When to use
- The user wants a Feishu / Lark whiteboard, infographic, diagram, poster, or visual explainer that
  should look good / branded / in a specific aesthetic.
- The user names a style, or points at one of the templates.
- The user gives content ("explain X as a whiteboard", "turn this into a board") and wants it
  visual and editable inside Feishu.

## Step 0 — Prerequisites (check before doing anything)
Run [`scripts/preflight.sh`](scripts/preflight.sh), or check manually:
- **Node ≥ 20.**
- **`lark-cli`** = npm package **`@larksuite/cli`**, installed **and authenticated**.
  If missing: `npm install -g @larksuite/cli`, then `lark-cli config init` (scan the QR), and
  `lark-cli auth login`.
- **`@larksuite/whiteboard-cli`** — used via `npx`, auto-downloads, no install needed.
- A **Feishu / Lark account** — the board is written to the user's own tenant.

If `lark-cli` is missing or not authenticated, tell the user exactly how to install/authenticate and
**stop** — you cannot write a board without it.

## Workflow
1. **Read [`RULES.md`](RULES.md) first.** It is the non-negotiable medium spec: native shapes only
   (rect / rounded-rect / circle / ellipse + connectors + text), no opacity, no gradients / filters /
   blur, no freeform / blob / organic shapes, one hardcoded font, and the **text-colour export
   caveat**. Following it is what keeps boards from rendering broken.
2. **Pick a template** from [`templates/`](templates/) — match the user's named style, or the mood of
   their content. Read its `design.md` (the palette + how to use the colours). Browse the gallery in
   [`README.md`](README.md).
3. **Compose the SVG** in a logical ~1600–1700-wide space, in that palette, with **native shapes
   only**. Lay the content out however it reads best (columns, flow, grid) — the template constrains
   *colour*, not layout. Every label is a `<text>`; never set `font-family`.
4. **Render it, then LOOK at the image and correct yourself** — overflow, tight margins/padding,
   numerals touching edges, accidental overlaps, clipping. Iterate render → view → fix until clean.
   (Commands and the full checklist are in `RULES.md` → Workflow.)
5. **Write it into a Feishu doc as an editable whiteboard**, then **view the live board image too**
   and fix any remaining layout issues. (Exact `lark-cli` commands in `RULES.md`.)

## Files
- **[`RULES.md`](RULES.md)** — the hard rules + the exact build / write / verify commands. Always read this.
- **[`templates/<slug>/design.md`](templates/)** — one per style: the colour palette + how to use it.
- **[`scripts/preflight.sh`](scripts/preflight.sh)** — dependency + auth check.
