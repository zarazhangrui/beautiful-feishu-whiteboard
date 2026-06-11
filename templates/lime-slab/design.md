---
version: 1.0
name: Lime Slab
renderer: feishu-svg-whiteboard
description: >
  A neobrutalist SaaS-landing aesthetic built on a single electric lime field and slab-heavy black type. Two flat canvases — an electric chartreuse hero and a warm cream body — host crisp white cards outlined in thin charcoal rules and squared pill chips. Depth is entirely flat: solid color blocks, hairline-but-readable borders, and big scale jumps, never a shadow. The type register is loud, tight, mixed-case display weight over quiet sentence-case body. Best for product explainers, feature breakdowns, comparison grids, and bright system maps that want energy without clutter.

# ── COLOR ────────────────────────────────────────────────────
colors:
  lime: "#EEFA79" # canvas / signature electric chartreuse hero field
  cream: "#FFFFF2" # canvas / calmer warm off-white body section
  white: "#FFFFFF" # cards / search bar / panels — pure white, sits on lime OR cream to carry detail
  ink: "#0A0A05" # ink / structure / all display type / connectors — near-black (sampled #000500)
  rule: "#2F2E25" # accent / warm charcoal for thin borders, chip/pill outlines, fine rules — use instead of pure black on small chips so the outline reads warm, not stark
  # Rule: 2 accents per scene — pick ONE canvas (lime OR cream) as the field, then ink + white cards; never stack lime+cream+white in one cluster. Dark text on light fills always (export can't be trusted for text color anyway).

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = flat color blocks (lime vs cream vs white),
# borders, panel role-swaps, and scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "2px solid #2F2E25"
  rule: "2px solid #2F2E25"
  radius: 12 # squared-soft: pills/chips use full radius (height/2); cards use 12; hero blocks 0
---

# Lime Slab — Feishu SVG Whiteboard Design System

A neobrutalist landing-page look: one electric lime field, heavy black slab-weight display, and crisp white cards with thin charcoal outlines on a warm cream body. Loud but tidy.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
