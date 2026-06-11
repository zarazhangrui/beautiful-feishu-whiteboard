---
version: 1.0
name: Riptide Cobalt
renderer: feishu-svg-whiteboard
description: >
  A two-tone Marimekko-grade poster system — electric cobalt and warm cream locked in interlocking color blocks, with no third color and no ornament. The canvas is warm cream; structure comes from big solid cobalt bands and chunky squared panels, never from shadow. Type is heavy and quiet, sitting in high-contrast panels so the loud color-blocking carries the energy. Best for bold single-idea hero boards, two-sided comparisons, simple stage flows, and section dividers where mood matters more than density.

# ── COLOR ────────────────────────────────────────────────────
colors:
  cream: "#FDF0E0" # canvas / background — warm off-white
  cobalt: "#375DFE" # accent-1 / hero color — electric blue, the loud half of the duotone; cobalt fields carry cream or paper text
  paper: "#FFFFFF" # pure-white mount / panel fill for small dark text (small labels always go in a paper/cream panel)
  ink: "#1A2240" # structure / dark text — deep navy-ink, reads as near-black; cream fields carry ink text
  cobalt-deep: "#2741C0" # accent-2 — darker cobalt, used sparingly for the occasional panel role-swap (darker block against a cobalt field) / heavier borders on cream
  # Rule: STRICT two-tone — cobalt + cream only per scene; ink for text, paper for panels.
  # This is a deliberately minimal duotone, NOT maximalist. Dark text on light fills.
  # Rule: never put ink-sized small text directly on cobalt unless it's display-scale (≥ ~64px).

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = the cobalt/cream figure-ground interplay,
# squared color blocks, panel role-swaps (cobalt block ↔ cream block), and scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "4px solid #1A2240"
  rule: "3px solid #1A2240"
  radius: 0 # panels are hard-squared by default; rounded-rect (rx) allowed as a deliberate per-block choice
---

# Riptide Cobalt — Feishu SVG Whiteboard Design System

A loud-but-quiet duotone: electric cobalt and warm cream interlock as bold rectangular bands and color blocks, while all text sits in calm high-contrast panels. The color does the shouting; the type stays composed.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
