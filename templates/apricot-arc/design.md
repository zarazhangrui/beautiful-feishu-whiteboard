---
version: 1.0
name: Apricot Arc
renderer: feishu-svg-whiteboard
description: >
  A warm mid-century geometric design system for Feishu SVG whiteboards. Soft cream canvas, no borders and no shadows — depth comes purely from flat apricot-and-salmon color-blocking and a signature half-circle (arc) motif laid out on a tight checkerboard rhythm. Rounded, friendly, two-hue palette with a deep terracotta ink reserved for text inside light panels. Calm and retro rather than loud. Built for explanatory diagrams that benefit from a soft, rhythmic, optimistic register: stages, comparisons, system maps, timelines, and step pipelines.

# ── COLOR ────────────────────────────────────────────────────
colors:
  cream:     "#FFF8EE"   # universal canvas background — warm soft ivory, never pure white
  paper:     "#FFFFFF"   # optional clean panel fill (highest-contrast card)
  orange:    "#F69834"   # primary accent — warm apricot orange
  salmon:    "#F9C2BD"   # secondary accent — soft salmon pink (pairs with orange)
  terracotta: "#C7561E"   # ink: text, big numerals, rules — a deep burnt tone from the orange family
  ink-2:     "#7A4A33"   # softer brown for secondary text on light panels
  # Use the 2-hue core (orange + salmon) per scene; terracotta is for ink only, not a fill block.
  # Dark (terracotta) text on light fills always. No black — the system stays warm.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — NO shadows of any kind (no blur, no duplicate-offset trick).
# Depth and hierarchy come from flat color blocks, the arc motif, panel role-swaps, and scale.
# The reference is borderless: prefer abutting flat shapes over outlined cards.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "none (flat fills, no borders) — use a 3px terracotta stroke ONLY when a panel must read as a discrete card"
  rule:       "3px solid terracotta"   # dividers, axes, connectors
  radius: 24                            # generously rounded corners (soft mid-century); 0 only for tight color-block tiling
---

# Apricot Arc — Feishu SVG Whiteboard Design System

A design system for building **explanatory diagrams** as editable Feishu whiteboards
written in SVG. The aesthetic is warm mid-century geometric: flat apricot-and-salmon
color on soft cream, rounded corners, **no borders and no shadows**, and a signature
**half-circle (arc) motif** tiled in a checkerboard rhythm. It feels retro, calm, and
optimistic — depth is carried entirely by flat color and scale, never by outlines or shading.

## Color

- **Cream** (`#FFF8EE`) is the universal background — a warm soft ivory, never pure white.
- **Orange** (`#F69834`) and **salmon** (`#F9C2BD`) are the two core accents; they harmonize
  rather than clash. This is a *quiet, warm* palette — the two hues alternate to create rhythm,
  not collision. Use both together in nearly every scene (that pairing IS the identity).
- **Terracotta** (`#C7561E`) is **ink only** — text, big numerals, and the occasional 3px rule.
  It is a burnt tone drawn from the orange family so the system never goes cold or black.
  **ink-2** (`#7A4A33`) softens secondary text on light panels.
- Because opacity is ignored, get a *lighter* shade by choosing a lighter solid (cream over salmon
  over orange), never by fading. Dark terracotta text on light fills, always — never light text on salmon.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
