---
version: 1.0
name: Berry Pop
renderer: feishu-svg-whiteboard
description: >
  A fresh, fruity brand palette: a clean white page with two pop accents, a deep raspberry-wine and a
  pale periwinkle. The raspberry is the loud hero (bold fills, headers, big blocks) and a darker wine
  doubles as the readable ink; the periwinkle is the soft cool counter, used for light panels and for
  text on a berry fill. Confident and playful, like a juice-bar or club logo. Flat color only, no
  gradients; hard offset shadows are fine.

# ── COLOR ────────────────────────────────────────────────────
colors:
  white: "#FFFFFF" # universal canvas: clean bright white
  berry: "#9E2B50" # PRIMARY accent: deep raspberry-wine. Hero fills, headers, key blocks
  berry-deep: "#6E1E3A" # darker wine: body/structural text on white, borders, hard shadows (the in-family "ink")
  peri: "#C7D2F0" # SECONDARY accent: pale periwinkle. Soft panels/fills, and large text on a berry fill
  peri-deep: "#9DB0E8" # stronger periwinkle: small accents, rules, dots where the pale tone is too faint
  # White page + two accent families. Berry leads, periwinkle supports; both share a scene. Berry-deep
  # is the text color on white. Keep two accents per scene; let the white breathe.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "Text is berry-deep on the white page (a deep wine that reads like ink). On a berry fill, use large bold white or pale periwinkle. Keep periwinkle out of small text on white (too pale)."
  note: "Large bold light text on the berry fill reads well on the live board. The image export renders text color unreliably, so judge color via --output_as raw or the live board, not the exported PNG."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "2 to 3px solid berry or berry-deep for cards and panels; many fills can be borderless flat color"
  rule: "2px solid berry-deep for dividers"
  radius: "rounded (rx 12 to 22) suits the soft, poppy mood; sharp (rx 0) is fine for crisp blocks"
---

# Berry Pop — Feishu SVG Whiteboard Design System

A bright white page with a raspberry-wine hero and a pale periwinkle counter. Lead with the berry on
fills and headers, support with the soft periwinkle, and write text in the deep wine so it reads like
ink while staying in the family. Keep the white open and let the two pops do the work.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
