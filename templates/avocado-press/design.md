---
version: 1.0
name: Avocado Press
renderer: feishu-svg-whiteboard
description: >
  A crisp duotone on a white page: a deep French blue and a pale avocado lime as the two accents,
  with the blue carrying the type. Blue leads as both the ink and the bold surface (header bands, key
  fills); lime is the punch (big numerals, a highlight chip, thin rules). Clean, modern, and airy:
  colour-blocks and whitespace do the structure, not heavy frames. Flat color only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  white: "#FFFFFF" # universal canvas: clean white page
  blue: "#0055A4" # deep French blue: PRIMARY accent and the ink — all text on white, header bands, the outcome bar, key surface fills; the structural identity
  lime: "#DCF4A2" # pale avocado lime: SECONDARY accent / the punch — big stage numerals, highlight chips, thin row rules, large display text on a blue fill
  # White page + two accents. Blue leads and carries the text; lime is the punch. Two accents per
  # scene; let the white breathe. Lime is too light for text on white, never use it there.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "On the white page, text is blue. On a blue fill, text is lime (large display) or white (body). Never use lime for text on white."
  note: "Large bold lime/white text on the blue fill reads well on the live board. The image export renders text color unreliably, so judge color via --output_as raw or the live board, not the exported PNG."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "minimal. Prefer blue colour-blocks and thin rules over heavy frames; no big outer frame"
  rule: "thin lime or blue rules for row dividers"
  radius: "low (rx 0 to 8); crisp and modern"
---

# Avocado Press — Feishu SVG Whiteboard Design System

A clean white page with a deep French blue that is both the ink and a bold surface, and a pale avocado
lime for the punch. Lead with blue (title, body, header bands), let lime snap in on the big numerals, a
highlight chip, and the thin rules, and keep the white open so the duotone pops. Airy, not boxed-in.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
