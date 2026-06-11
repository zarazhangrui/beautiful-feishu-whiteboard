---
version: 1.0
name: Court Press
renderer: feishu-svg-whiteboard
description: >
  A flat sports-poster system on a warm off-white page, with grass green and dusty pink as the two
  accents. Green carries the header bands, number balls, headings, and the closing banner; pink is the
  punch (balls, dividers, badges); deep-forest type does the talking on the cream. The mood is
  editorial-athletic, a pink-and-green complementary clash on a clean page. No shadows: depth comes
  from flat colour blocks, chalk-line rules, and scale. Built for explainers, processes, and playful
  step-by-step boards.

# ── COLOR ────────────────────────────────────────────────────
colors:
  chalk: "#F2EFE6" # warm off-white — the page canvas, and large display text on a green fill
  green: "#66914C" # grass green — PRIMARY accent: header bands, number balls, headings, closing banner
  pink: "#DA9EB7" # dusty pink — SECONDARY accent: balls, divider rules, badges
  forest: "#2F4224" # deep green-black — body & label text on the cream page and white panels
  white: "#FFFFFF" # content panels on the cream page (give them a thin green border so they read)
  # Cream page + two accents (green leads, pink punches). Pink-against-green is the signature clash.

# ── TEXT COLOR (critical for contrast) ───────────────────────
text-rules:
  on-cream: "FOREST for body, GREEN for headings — both dark, always readable on the off-white page."
  on-white: "FOREST body, GREEN headings — always crisp."
  on-green: "CHALK / white for LARGE bold display (≥ ~28px). Never small chalk text on green."
  on-pink: "FOREST text — always crisp."

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — NO shadows of any kind. Depth = flat colour blocks, chalk-line rules, and scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  border: "2px solid green" # thin border on white panels so they read on the cream page
  line: "3px solid pink or green" # divider rules / court-line motif
  radius: 0 # squared cards; circles (balls) are the curved motif
---

# Court Press — Feishu SVG Whiteboard Design System

A flat sports poster you can read at a glance. A warm off-white page, white panels with thin green
borders, dusty-pink balls as the recurring motif, and grass-green header bands and number balls
carrying the energy. Deep-forest type does the talking on the cream. Minimal and athletic, a
pink-and-green clash on a clean page, never heavy, never shadowed.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
