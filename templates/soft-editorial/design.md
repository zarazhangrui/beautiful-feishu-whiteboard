---
version: 1.0
name: Soft Editorial
renderer: feishu-svg-whiteboard
description: >
  A warm magazine-spread palette in the register of a small-press literary quarterly. A warm
  aged-cream page hosts soft pastel cards in five interchangeable candy tones (dusty pink,
  chartreuse lemon, peach blush, sage, lilac), with warm near-black ink on every surface. Gentle
  and bookish, not technical. Depth comes from flat pastel color blocks on cream and generous
  space, never gradients or shadows. Built for calm explainers, overviews, and boards that should
  feel like a printed editorial page.

# ── COLOR ────────────────────────────────────────────────────
colors:
  paper:    "#F2EEDF"   # universal canvas: warm aged cream, never screen white
  paper-2:  "#ECE6D2"   # slightly cooler cream for adjacent-surface separation; used sparingly
  ink:      "#2A241B"   # ALL text on every surface: warm near-black, brown bias, never pure #000
  ink-soft: "#5C5345"   # secondary text: captions, leads, descriptions, page markers
  pink:     "#E1A4C2"   # pastel card fill: dusty rose
  lemon:    "#D6DD63"   # pastel card fill: chartreuse, the brightest accent
  blush:    "#E8C9B6"   # pastel card fill: soft peach, the most neutral pastel
  sage:     "#B7C7A8"   # pastel card fill: muted green
  lilac:    "#C9BEDC"   # pastel card fill: soft violet-grey, the cool counterpart to sage
  # The five pastels are interchangeable PAINTS with NO fixed semantic role (lemon is not
  # "warning", pink is not "error"). Cycle through them for variety, often 3 or 4 on one scene.
  # Text never inverts: ink stays warm near-black on cream and on every pastel.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "0 by default. Pastel cards are flat fills; add an optional 2px ink hairline only if a card needs to read as distinct."
  radius: "rounded (rx 16 to 28) for the soft card feel; sharp (rx 0) is allowed when a crisper block is wanted. Both are native."
---

# Soft Editorial — Feishu SVG Whiteboard Design System

A warm, paper-feeling palette: a single aged-cream field with soft pastel cards floating on top and
calm warm-black ink. The mood is a literary quarterly or a design-research notebook, not a tech
keynote. Let the cream breathe, let two or three pastels share a scene, and keep every label in ink.

## Color

- **Paper** (`#F2EEDF`): The cream page. The default background, the constant across the board. Warm and aged, never bright white.
- **Paper Alt** (`#ECE6D2`): A slightly cooler cream for separating one surface from an adjacent one. Used sparingly; many boards never need it.
- **Ink** (`#2A241B`): Warm near-black with a brown bias. The primary text color on every surface, cream or pastel. Never pure black.
- **Ink Soft** (`#5C5345`): A muted warm grey-brown. Secondary text: captions, leads, descriptions, small markers.
- **Pink** (`#E1A4C2`): Dusty rose pastel. A card fill.
- **Lemon** (`#D6DD63`): Chartreuse yellow-green. The brightest pastel, good for a hero card.
- **Blush** (`#E8C9B6`): Soft peach. The most neutral pastel, good for a calm card.
- **Sage** (`#B7C7A8`): Muted green.
- **Lilac** (`#C9BEDC`): Soft violet-grey, the cool counterpart to sage.

The five pastels carry no fixed meaning. Treat them as interchangeable paints and rotate through them
for variety, with three or four visible on a busier scene. Text stays in ink on every one of them: the
system never inverts to light text on a pastel.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
