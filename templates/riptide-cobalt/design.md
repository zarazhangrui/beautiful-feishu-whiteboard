---
version: 1.0
name: Riptide Cobalt
renderer: feishu-svg-whiteboard
description: >
  A two-tone Marimekko-grade poster system — electric cobalt and warm cream locked in interlocking color blocks, with no third color and no ornament. The canvas is warm cream; structure comes from big solid cobalt bands and chunky squared panels, never from shadow. Type is heavy and quiet, sitting in high-contrast panels so the loud color-blocking carries the energy. Best for bold single-idea hero boards, two-sided comparisons, simple stage flows, and section dividers where mood matters more than density.

# ── COLOR ────────────────────────────────────────────────────
colors:
  cream:  "#FDF0E0"   # canvas / background — warm off-white
  cobalt: "#375DFE"   # accent-1 / hero color — electric blue, the loud half of the duotone
  paper:  "#FFFFFF"   # pure-white mount / panel fill for small dark text
  ink:    "#1A2240"   # structure / dark text — deep navy-ink, reads as near-black
  cobalt-deep: "#2741C0"  # accent-2 — darker cobalt for panel role-swap / borders on cream
  # Rule: STRICT two-tone — cobalt + cream only per scene; ink for text, paper for panels.
  # This is a deliberately minimal duotone, NOT maximalist. Dark text on light fills.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = the cobalt/cream figure-ground interplay,
# squared color blocks, panel role-swaps (cobalt block ↔ cream block), and scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "4px solid #1A2240"
  rule:       "3px solid #1A2240"
  radius: 0   # panels are hard-squared by default; rounded-rect (rx) allowed as a deliberate per-block choice
---

# Riptide Cobalt — Feishu SVG Whiteboard Design System

A loud-but-quiet duotone: electric cobalt and warm cream interlock as bold rectangular bands and color blocks, while all text sits in calm high-contrast panels. The color does the shouting; the type stays composed.

## Color
A strict **two-tone duotone**: `cobalt #375DFE` and `cream #FDF0E0` are the whole show — never introduce a third hue per scene. `ink #1A2240` is the only text/structure color (a deep navy that reads near-black); `paper #FFFFFF` is the fill for any panel that must hold small dark text. `cobalt-deep #2741C0` exists only for the occasional panel role-swap (a darker block against a cobalt field) or a heavier border on cream — use it sparingly.

The figure-ground tension between cobalt and cream *is* the identity, so commit fully: large rectangular fields of each, abutting flush along clean straight edges. Cobalt fields carry **cream or paper** text; cream fields carry **ink** text. Never put ink-sized small text directly on cobalt unless it's display-scale (≥ ~64px) — small labels always go in a paper/cream panel.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
