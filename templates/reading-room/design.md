---
version: 1.0
name: Reading Room
renderer: feishu-svg-whiteboard
description: >
  A quiet literary-editorial system built from cream paper, a thin drawn black frame,
  and big all-caps headline type, warmed by three soft pastel color-blocks (lilac,
  terracotta, butter). The structural signature is a hand-drawn-feeling outline:
  uniform thin black borders around everything, flat pastel fills, and generous
  whitespace — depth comes from framing and scale, never shadows. The type register
  is heavy display caps over light, calm body. Best for calm explainers, reading/learning
  guides, editorial timelines, and gentle comparisons where a poised, bookish tone beats
  loud contrast.

# ── COLOR ────────────────────────────────────────────────────
colors:
  canvas:     "#F6EBD8"   # canvas — warm cream paper
  ink:        "#0B0A09"   # ink / structure — near-black line, frame, display type
  lilac:      "#D6C7CC"   # accent-1 — soft lavender (bedding pastel)
  terracotta: "#DE916A"   # accent-2 — warm clay (the mug)
  butter:     "#F1DAB1"   # accent-3 — pale butter (open book pages)
  # Rule: 2–3 accents per scene over the cream canvas. The cream IS the breathing room —
  # leave most of it empty. All structure and most text is ink on cream; pastels are
  # large flat blocks, never small low-contrast labels. Dark ink text on every light fill.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind (no blur, no offset-duplicate trick).
# Depth = the thin black outline frame, flat pastel color blocks, panel role-swaps,
# scale (monumental headline vs calm body), and generous cream whitespace.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "2.5px solid #0B0A09"   # every panel/box — uniform thin drawn line
  rule:       "2.5px solid #0B0A09"   # divider rules and the outer page frame
  radius: 0   # squared corners; the ONE rounded exception is the mug/badge "cup" motif (large radius pill)
---

# Reading Room — Feishu SVG Whiteboard Design System

A poised, bookish editorial system: cream paper inside a thin drawn black frame, a
monumental all-caps headline, and a few soft pastel blocks doing the only coloring. It
reads like a literary poster — calm, line-driven, lots of empty cream.

## Color

Five roles. `canvas` (#F6EBD8 cream) is the whole field and the breathing room — keep the
majority of the board empty cream. `ink` (#0B0A09) carries every border, the outer frame, the
display headline, and nearly all body text. The three pastels — `lilac` #D6C7CC, `terracotta`
#DE916A, `butter` #F1DAB1 — are used as **large flat color blocks** (panel fills, a big numeral,
a wide banner), never as small text and never as a fill behind small text. Temperature is warm
and harmonized, not clashing: the lilac is the only cool note and it grounds the warm pair.

Per scene use **2–3 accents max** over cream. Every fill (cream or pastel) is light, so **all text
is dark ink** for contrast. If you want a tinted area, use the solid pastel itself — never opacity.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
