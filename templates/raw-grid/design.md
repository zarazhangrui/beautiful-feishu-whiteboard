---
version: 1.0
name: Raw Grid
renderer: feishu-svg-whiteboard
description: >
  A neo-brutalist system where the borders ARE the layout. Pure white canvas, 3px solid black structure, and two muted pastel accents (blush + sage) plus neutral gray. Depth is hard black offset shadows — never blurred, never colored. Cells abut without gaps; a giant solid numeral anchors each step. Sharp, system-native, unmistakably digital — closer to a protest poster meets a Notion board than a polished deck.

# ── COLOR ────────────────────────────────────────────────────
colors:
  black: "#0A0A0A" # all borders, rules, shadows, primary text
  white: "#FFFFFF" # universal canvas + default cell fill
  pink: "#F2D4CF" # muted blush accent fill
  green: "#E5EDD6" # muted sage accent fill
  gray: "#F5F5F5" # neutral recessed cell
  darkgray: "#333333" # secondary text
  # Quiet palette: white + black structure + 1–2 pastels per scene. The pastels
  # warm the high contrast; they never shout. Never put pink and green in the same cell.

# ── SHADOW ───────────────────────────────────────────────────
shadow:
  recipe: "redraw the shape in BLACK behind the real shape, offset on x and y"
  default: "+6px" # featured blocks
  small: "+4px" # secondary blocks
  # Always black. Never colored. Never blurred.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  primary: "3px solid black" # every cell, panel, box — borders meet flush, no gaps
  radius: 0 # squared corners always
---

# Raw Grid — Feishu SVG Whiteboard Design System

The borders _are_ the design. Build the board as a tight grid of black-bordered cells
that meet flush, fill them with white and muted pastels, and anchor each step with a giant
solid numeral in its own zone. The effect is sharp, system-native, digital.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
