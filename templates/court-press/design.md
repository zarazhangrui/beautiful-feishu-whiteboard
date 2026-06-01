---
version: 1.0
name: Court Press
renderer: feishu-svg-whiteboard
description: >
  A flat sports-poster system on a grass-green field. Off-white "court lines" divide the canvas, dusty-pink circles read as balls, and deep-forest type carries every label. The mood is editorial-athletic — minimal, confident, a pink-on-green complementary clash. No borders-heavy brutalism and NO shadows: depth comes from flat color blocks, chalk rules, and scale. Built for explainers, processes, and playful step-by-step boards.

# ── COLOR ────────────────────────────────────────────────────
colors:
  court:   "#66914C"   # grass-green — the canvas / field
  court-2: "#5A8043"   # one step deeper green — recessed panels
  forest:  "#2F4224"   # deep green-black — lines, borders, ALL body & label text
  pink:    "#DA9EB7"   # dusty pink — the punch accent: balls, fills, the closing banner
  chalk:   "#F2EFE6"   # warm off-white — court lines, cards/panels, LARGE display text on green
  # Two accents in play (pink + chalk) over the green field. Pink-on-green is the signature clash.

# ── TEXT COLOR (critical on a colored canvas) ────────────────
text-rules:
  on-green:  "Use FOREST (dark) for any size — always reliable. CHALK only for LARGE, bold display (≥ ~28px). Never small chalk text on green."
  on-chalk:  "FOREST text — always crisp."
  on-pink:   "FOREST text — always crisp."

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — NO shadows of any kind. Depth = flat color blocks, chalk court-lines, and scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  border: "3px solid forest"   # cards, banners (used sparingly — this style is light on borders)
  line:   "3px solid chalk"    # the signature court-line divider on the green field
  radius: 0                    # squared cards; circles (balls) are the curved motif
---

# Court Press — Feishu SVG Whiteboard Design System

A flat sports poster you can read at a glance. A grass-green field, off-white court lines
dividing it, dusty-pink balls as the recurring motif, and deep-forest type doing the talking.
Minimal and athletic — never heavy, never shadowed.

## Color

The **green field** (`#66914C`) is the canvas. **Forest** (`#2F4224`) is the structural ink —
every line, border, and body label. **Chalk** (`#F2EFE6`) draws the court lines, fills the cards,
and is the only color allowed for *large* display text on the green. **Pink** (`#DA9EB7`) is the
punch: balls, accent fills, and the closing banner. Pink against green is the whole identity —
let it clash. Use a deeper green (`#5A8043`) only to recess a panel.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
