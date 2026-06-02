---
name: beautiful-feishu-whiteboard
version: 1.1.0
description: >
  A library of 37 curated colour palette styles for building beautiful, editable Feishu / Lark
  (飞书) whiteboards from SVG. Use this whenever the user wants to create or draw a Feishu whiteboard,
  infographic, diagram, poster, or visual explainer and wants it to look polished, on brand, or in a
  particular aesthetic, or when they name a style. The agent figures out what board the user wants,
  asks about the visual vibe, picks a fitting style from the catalogue, generates an editable Feishu
  whiteboard, returns the doc link and the rendered image, and offers to switch styles. Requires
  lark-cli (npm @larksuite/cli) installed and authenticated, and a Feishu/Lark account.
---

# Beautiful Feishu Whiteboard

A design system skill: **37 colour palette styles** plus the verified **hard rules** of the Feishu
SVG whiteboard medium, so you can build gorgeous, on brand, *editable* whiteboards.

This is **not** an auto layout chart generator. **You** compose the layout. A template gives you a
**palette and mood**; [`RULES.md`](RULES.md) gives you the medium's hard limits. The board you
produce is a real, editable Feishu whiteboard inside a doc, not a screenshot.

## When to use
- The user wants a Feishu / Lark whiteboard, infographic, diagram, poster, or visual explainer that
  should look good, branded, or in a specific aesthetic.
- The user names a style, or points at one of the templates.
- The user gives content ("explain X as a whiteboard", "turn this into a board") and wants it
  visual and editable inside Feishu.

## Step 0: prerequisites (check before doing anything)
Run [`scripts/preflight.sh`](scripts/preflight.sh), or check manually:
- **Node 20 or newer.**
- **`lark-cli`** (npm package **`@larksuite/cli`**), installed **and authenticated**. If missing:
  `npm install -g @larksuite/cli`, then `lark-cli config init` (scan the QR), then `lark-cli auth login`.
- **`@larksuite/whiteboard-cli`**, used via `npx`, auto downloads, no install needed.
- A **Feishu / Lark account**. The board is written to the user's own tenant.

If `lark-cli` is missing or not authenticated, tell the user exactly how to install and
authenticate, then stop. You cannot write a board without it.

## How to run the conversation

1. **Understand the board.** Find out what the user wants on it: the content, the purpose, the
   audience. If it is unclear, ask one short question before building.
2. **Ask about the vibe.** Ask the user what visual style they want, for example playful or
   professional, any colour or mood preference, or a brand to match. Offer to pick for them if they
   have no preference. If they already named a style, skip ahead.
3. **Pick a style.** Use [`CATALOG.md`](CATALOG.md) to match the content type and the requested vibe
   and formality to one of the 37 styles. Tell the user which style you chose and why, in one line.
4. **Build it.** Read [`RULES.md`](RULES.md) and the chosen [`templates/<slug>/design.md`](templates/),
   then:
   - Compose the SVG in a logical space about 1600 to 1700 wide, in that palette, with **native
     shapes only** (rect, rounded rect, circle, ellipse, connectors, text). Lay the content out
     however reads best. Every label is a `<text>`; never set `font-family`.
   - **Only the content goes on the board, never the instruction behind it.** Do not print the
     user's prompt, scope notes, source citations, the chosen style name, or any "summary of… /
     来源… / 风格…" meta line onto the canvas — that looks like a homework header. Such context
     belongs in your chat reply. (See the "Never echo the user's instructions" rule in `RULES.md`.)
   - **Render it, then look at the image and correct yourself**: fix text overflow, tight margins or
     padding, numerals touching edges, accidental overlaps, and clipping. Iterate render, view, fix
     until it is clean. (Commands and the full checklist are in `RULES.md`.)
   - Write it into a Feishu doc as an editable whiteboard, then view the live board image too and fix
     any remaining layout issues.
5. **Deliver.** Give the user **both**: the **Feishu doc link** and the **rendered image** itself, so
   they can see it without opening the doc. Then tell them they can **switch to a different style**
   any time, and you will re render the same content in the new palette.

## Files
- **[`RULES.md`](RULES.md)**: the hard rules and the exact build, write, and verify commands. Always read this.
- **[`CATALOG.md`](CATALOG.md)**: every style with its vibe, formality, and what it is good for. Use it to choose.
- **[`templates/<slug>/design.md`](templates/)**: one per style, the colour palette and how to use it.
- **[`scripts/preflight.sh`](scripts/preflight.sh)**: dependency and auth check.
