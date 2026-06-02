---
version: 1.0
name: Bold Poster
renderer: feishu-svg-whiteboard
description: >
  A populist editorial-poster palette of uncompromising restraint: a white canvas, a deep brown-black
  ink, a single saturated tomato red, and a warm off-white for alternating panels. No secondary brand
  colors, no tints, no semantic state colors. Red is reserved for emphasis moments only (numerals,
  active rules, calls to action, full-bleed statement panels), never body text or an empty fill. Loud,
  confident, and unmistakably print-poster. The only depth is a single hard offset shadow behind red
  display text.

# ── COLOR ────────────────────────────────────────────────────
colors:
  bg:    "#FFFFFF"   # pure white canvas: the default ground, reads as fresh newsprint
  dark:  "#1C1410"   # deep brown-black: ALL body text, borders, labels, and dark panel grounds
  red:   "#D8000F"   # saturated tomato red: the single accent, for emphasis moments only
  light: "#F5F2EF"   # warm off-white: alternating panel backgrounds and chrome, subtly warmer than bg
  # Two-color identity: brown-black ink on white, with red as the sole accent. Red is never body
  # text, never a tint, never a card fill without overlaid text.

# ── SHADOW ───────────────────────────────────────────────────
shadow:
  recipe: "redraw the shape or word once in dark behind the real red display text, offset on x and y"
  use:    "only behind large red display numerals or words; everything else stays flat"

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "1.5 to 3px solid dark for borders and rules"
  rule:       "the active emphasis rule is red; structural rules are dark"
  radius:     "0; squared print-poster corners"
---

# Bold Poster — Feishu SVG Whiteboard Design System

White paper, brown-black ink, one tomato red. The discipline is the point: every emphasis moment is
red and nothing else is, so the red has to be earned. Use the warm off-white only to stripe alternating
panels, keep borders and body in the brown-black, and let a single hard offset shadow sit behind a red
display word for poster weight.

## Color

- **Bg** (`#FFFFFF`): Pure white canvas. The default ground for most surfaces. Reads as fresh newsprint.
- **Dark** (`#1C1410`): A deep brown-black with a warm bias, not pure black. Every line of body text, every border, every small label, and any full-bleed dark panel. The warmth distinguishes it from a generic editorial black.
- **Red** (`#D8000F`): Saturated tomato red. The single accent. Use it for numerals, section eyebrows, the active emphasis rule, bullet glyphs, the progress bar, calls to action, and full-bleed statement panels. Never use it as body text, as a tint, or as a card fill without text on top.
- **Light** (`#F5F2EF`): Warm off-white. Use it to stripe alternating panels and for small chrome backgrounds. Subtly warmer than the white canvas, so it differentiates a surface without breaking the printed-paper register.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
