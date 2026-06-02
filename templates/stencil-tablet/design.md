---
version: 1.0
name: Stencil & Tablet
renderer: feishu-svg-whiteboard
description: >
  A West Coast skate-poster meets municipal-stencil palette. A warm bone-cream field carries rounded
  "tablet" cards in a saturated retro-print accent set (sienna, magenta, orange, teal, blue, mustard,
  olive). The accents read as printed ink, slightly muted but unmistakably saturated, and the color
  blocks act as the layout so a board's structure reads from across the room. A black alternate field
  with bone type appears on section dividers. Flat color only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  bone:    "#E2DCC9"   # default page field: warm cream with a green-grey undertone, reads as kraft
  black:   "#000000"   # dark field for dividers and bold statements; type inverts to bone on it
  ink:     "#0A0A0A"   # near-black text on light surfaces, slightly softer than pure black
  paper:   "#F4EFE0"   # lighter cream than bone, for cards that should sit lighter (tables, frames)
  sienna:  "#A06A3C"   # retro-print accent: warm brown-orange, the earthiest
  magenta: "#C73B7A"   # retro-print accent: saturated pink-red, the loudest warm
  orange:  "#EE7A2E"   # retro-print accent: bright orange, the most-used accent
  teal:    "#2D7E73"   # retro-print accent: deep blue-green, the cool counterpart to orange
  blue:    "#3F73B7"   # retro-print accent: mid-tone process blue
  mustard: "#D8A93B"   # retro-print accent: saturated yellow-orange
  olive:   "#6F7A2E"   # retro-print accent: muted yellow-green, the least-used, for variety
  # Color blocks ARE the layout: rounded tablet cards in 2 to 4 accents tile the canvas. The
  # accents are printed-ink saturation, not pastels. Use bone or paper text on a saturated card.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "0 by default; the saturated tablet fills carry the structure. Optional 2px ink border."
  radius: "high rounded (rx 22 to 26): the cards are soft 'tablets'."
---

# Stencil & Tablet — Feishu SVG Whiteboard Design System

A bone-cream poster wall tiled with rounded color tablets in a saturated retro-print accent set. The
color blocks do the layout, so build the board as geometric tiles you could read from across the
room. Keep type bold and large, and let two to four accents share a scene.

## Color

- **Bone** (`#E2DCC9`): The default page field. A warm cream with a green-grey undertone, reading as canvas, kraft, or a slightly aged poster.
- **Black** (`#000000`): The dark field, used for dividers and bold statements. Type inverts to bone on it.
- **Ink** (`#0A0A0A`): Near-black text on light surfaces, slightly softer than pure black so it reads as ink.
- **Paper** (`#F4EFE0`): A lighter cream than bone, for cards that should sit lighter against the field (tables, chart frames, timeline bars).
- **Sienna** (`#A06A3C`): Warm brown-orange, the earthiest accent.
- **Magenta** (`#C73B7A`): Saturated retro pink-red, the loudest warm accent.
- **Orange** (`#EE7A2E`): Bright orange, the most-used accent.
- **Teal** (`#2D7E73`): Deep blue-green, the cool counterpart to orange.
- **Blue** (`#3F73B7`): Mid-tone process blue.
- **Mustard** (`#D8A93B`): Saturated yellow-orange.
- **Olive** (`#6F7A2E`): Muted yellow-green, the least-used accent, kept for variety.

The accents are printed-ink saturation, not pastels. Put bone or paper text on a saturated card so it
stays legible, and let the color blocks define the structure rather than borders.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
