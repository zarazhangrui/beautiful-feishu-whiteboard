---
version: 1.0
name: Coral
renderer: feishu-svg-whiteboard
description: >
  A warm, friendly editorial palette built around a single signature coral. A vivid orange-red coral
  works both as accent (rules, borders, dots, eyebrows, numerals) and as a full-region surface, over a
  warm cream canvas with near-black ink, neutral greys, and white cards. Clean and confident, neither
  corporate-cold nor neon. Flat color only on the whiteboard: where the source used a coral gradient,
  use the flat coral or the darker coral as a second tone instead.

# ── COLOR ────────────────────────────────────────────────────
colors:
  coral:      "#E85D5D"   # the signature: warm orange-red, used as accent AND as a full-region surface
  coral-dark: "#D44A4A"   # darker coral: a second coral for layered blocks or a comparison series (no gradient)
  cream:      "#F5F0E8"   # the warm canvas; also body text color on dark/ink surfaces
  cream-dark: "#E8E0D4"   # a slightly deeper cream for subtle region differentiation; sparing
  black:      "#1A1A1A"   # near-black ink: headlines on cream, plus a full ink register for quotes
  gray:       "#6B6B6B"   # mid neutral: body paragraph text on cream, meta labels, card copy
  light-gray: "#B0B0B0"   # pale neutral: tertiary text where gray is too strong; sparing
  white:      "#FFFFFF"   # true white: card fills (the cards that sit on the cream canvas)
  # Coral defines the system. Use it as the one accent and as the hero surface; keep everything else
  # neutral so the coral stays the voice.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "white cards on cream; a coral top border (4 to 5px) or left border is the signature card mark"
  rule:       "coral for accent rules and eyebrows; black for title rules; coral dot for timeline points"
  radius:     "low (rx 0 to 12); clean and modern"
---

# Coral — Feishu SVG Whiteboard Design System

One warm coral does the talking. It is both the accent (a thin rule, a card border, a dot, an eyebrow,
a numeral) and the hero surface (a cover band, a feature region, a left panel). Everything else stays
neutral, cream and grey and white, so the coral always reads as the signature. Keep fills flat: use the
darker coral as a second tone where the source deck reached for a gradient.

## Color

- **Coral** (`#E85D5D`): The signature, a warm orange-red, vivid but not neon. Use it as accent (card top or left border, a short accent line, a quote accent, a timeline dot, a chart primary series, section eyebrows, numerals on cream) and as a full-region surface (a cover band, a two-column left panel, a feature region).
- **Coral Dark** (`#D44A4A`): A darker coral. Use it as a second coral for a layered block or a comparison series. On the whiteboard, replace any coral gradient with this flat darker tone.
- **Cream** (`#F5F0E8`): The warm canvas. The default background, and the body text color on dark or ink surfaces.
- **Cream Dark** (`#E8E0D4`): A slightly deeper cream for subtle region differentiation. Used sparingly.
- **Black** (`#1A1A1A`): Near-black ink. Headlines on cream, plus a full ink register for quote or statement scenes, and timeline or title rules.
- **Gray** (`#6B6B6B`): Mid neutral. Body paragraph text on cream, meta labels, card copy, roles.
- **Light Gray** (`#B0B0B0`): Pale neutral. Tertiary text where gray is too strong. Used sparingly.
- **White** (`#FFFFFF`): True white. The card fills that sit on the cream canvas.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
