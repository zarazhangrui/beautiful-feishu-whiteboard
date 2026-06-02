---
version: 1.0
name: Cartesian
renderer: feishu-svg-whiteboard
description: >
  A quiet, architectural palette built on warm neutrals and thin lines. A warm sandstone off-cream
  canvas (closer to a manila folder than white paper), near-black ink for headlines and numerals, a
  warm grey for body, a taupe for small labels, and a single pale-taupe hairline that does all the
  structural work. No color accent at all: the precision comes from alignment and 1px lines, not
  from fills. Restrained and institutional. Flat only, no gradients or shadows.

# ── COLOR ────────────────────────────────────────────────────
colors:
  bg-primary:     "#EDE8E0"   # canvas: warm sandstone off-cream, manila-folder tone
  bg-secondary:   "#E2DBD1"   # deeper stone for placeholders or subtle region separation, no border needed
  text-primary:   "#1A1A1A"   # near-black ink: headlines, stat numerals, the strongest contrast
  text-secondary: "#5A5A5A"   # medium warm grey: all body paragraph text, readable but recedes
  accent:         "#8A8178"   # warm taupe: the small-text color (labels, attributions, counters)
  line:           "#B8B0A4"   # pale taupe: the universal 1px line for borders, rules, connectors, rings
  # No color accent: taupe is a neutral. The 1px line carries the structure. Keep fills to the
  # two stone tones and let alignment do the design.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "1px solid line (pale taupe) for every card border, rule, connector, and ring"
  rule:       "1px solid line; a heavier accent rule can use text-primary (near-black) when needed"
  radius:     "low to none (rx 0 to 6); crisp and precise"
---

# Cartesian — Feishu SVG Whiteboard Design System

A warm neutral system where thin lines do the work. The canvas is a sandstone off-cream, the type is
near-black and warm grey, and a single pale-taupe hairline draws every border, rule, and connector.
There is no color accent: reach for this when the board should feel precise, architectural, and quiet.

## Color

- **Background Primary** (`#EDE8E0`): The canvas. Warm sandstone off-cream, closer to a manila folder than white paper. The default background.
- **Background Secondary** (`#E2DBD1`): A slightly deeper stone for image placeholders or any region that needs subtle separation from the canvas without a colored fill or a border.
- **Text Primary** (`#1A1A1A`): Near-black ink. Headlines, stat numerals, and any strong horizontal accent rule. The strongest contrast in the system.
- **Text Secondary** (`#5A5A5A`): Medium warm grey. All body paragraph text. Softer than ink, readable but receding.
- **Accent** (`#8A8178`): Warm taupe. The small-text color: labels, attributions, agenda numerals, counters, role text.
- **Line** (`#B8B0A4`): Pale taupe. The universal 1px line: card borders, rules, timeline connectors, photo rings, decoration rings.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
