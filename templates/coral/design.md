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
  coral: "#E85D5D" # signature — warm orange-red, vivid not neon. Accent (card top/left border, accent line, quote accent, timeline dot, chart primary, section eyebrows, numerals on cream) AND hero surface (cover band, two-column left panel, feature region)
  coral-dark: "#D44A4A" # darker coral — a second tone for a layered block or a comparison series; replaces any coral gradient (flat only)
  cream: "#F5F0E8" # warm canvas (default background); also body text color on dark/ink surfaces
  cream-dark: "#E8E0D4" # slightly deeper cream for subtle region differentiation; sparing
  black: "#1A1A1A" # near-black ink — headlines on cream, plus a full ink register for quote/statement scenes, and title/timeline rules
  gray: "#6B6B6B" # mid neutral — body paragraph text on cream, meta labels, card copy, roles
  light-gray: "#B0B0B0" # pale neutral — tertiary text where gray is too strong; sparing
  white: "#FFFFFF" # true white — card fills that sit on the cream canvas
  # Coral defines the system: use it as the one accent and the hero surface; keep everything else neutral so coral stays the voice.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "white cards on cream; a coral top border (4 to 5px) or left border is the signature card mark"
  rule: "coral for accent rules and eyebrows; black for title rules; coral dot for timeline points"
  radius: "low (rx 0 to 12); clean and modern"
---

# Coral — Feishu SVG Whiteboard Design System

One warm coral does the talking. It is both the accent (a thin rule, a card border, a dot, an eyebrow,
a numeral) and the hero surface (a cover band, a feature region, a left panel). Everything else stays
neutral, cream and grey and white, so the coral always reads as the signature. Keep fills flat: use the
darker coral as a second tone where the source deck reached for a gradient.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
