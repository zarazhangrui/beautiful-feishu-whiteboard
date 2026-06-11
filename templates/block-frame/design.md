---
version: 1.0
name: BlockFrame
renderer: feishu-svg-whiteboard
description: >
  A maximalist neo-brutalist system built on 4px black borders, big 8px hard offset shadows, and a high-key candy palette of five saturated pastels plus cream. Display type is heavy uppercase. Tilted decorative shapes — rotated badges and rectangles — puncture the borders and break the grid on purpose. Pastels are paired loudly: pink + blue + green + yellow + cream cycle through every region. Borrows from zine layout, 90s sticker books, and toy packaging — bold, joyful, slightly chaotic, never timid.

# ── COLOR ────────────────────────────────────────────────────
colors:
  black: "#000000" # all borders, shadows, primary text
  white: "#FFFFFF"
  offwhite: "#FFFDF5" # default warm canvas
  pink: "#FE90E8" # candy magenta
  blue: "#C0F7FE" # ice blue
  green: "#99E885" # lime
  yellow: "#F7CB46" # marigold
  cream: "#FFDC8B" # warm cream
  # UNLIKE most systems and the usual "use 2–3 accents" rule: here use the candy pastels LOUDLY and
  # TOGETHER. Cycle pink → blue → green → yellow → cream across adjacent cards/badges with deliberate
  # clash/juxtaposition. More is more — the joy comes from the juxtaposition, don't tone it down.

# ── SHADOW ───────────────────────────────────────────────────
shadow:
  recipe: "redraw the shape behind the real one, offset on x and y"
  default: "+8px black" # the signature chunky shadow
  small: "+4px black"
  featured: "+12px yellow" # closing / hero block — colored offset is allowed here
  # Never blurred.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  primary: "4px solid black"
  thin: "3px solid black"
  radius: 0 # squared (a single rounded pill badge is the only exception)
---

# BlockFrame — Feishu SVG Whiteboard Design System

Loud, joyful neo-brutalism. Thick black borders, chunky 8px offset shadows, and a candy
palette piled on without restraint. Tilted badges and blocks puncture the grid. The board
should feel like a sticker book or toy package — graphic, playful, a little chaotic.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
