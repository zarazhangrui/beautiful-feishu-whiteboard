---
version: 1.0
name: Stripe
renderer: feishu-svg-whiteboard
description: >
  A fintech-modern system drawn from Stripe's product palette: Downriver navy ink on a cool
  near-white canvas, with the signature #635BFF indigo carrying every outline and connector. Soft
  grey offset shadows give quiet depth without weight. Clean, trustworthy, developer-grade.

# ── COLOR ────────────────────────────────
colors:
  navy:           "#0A2540"   # Downriver — primary text, structure, headings
  canvas:         "#F6F9FC"   # Black Squeeze — canvas + default cell fill
  indigo:         "#635BFF"   # Cornflower — cell outlines & connectors (the accent that carries)
  lavender:       "#E6E6FE"   # accent panel A — soft indigo tint
  sky:            "#DCEAFE"   # accent panel B — soft blue tint
  mist:           "#EDF1F7"   # neutral recessed cell
  slate:          "#425466"   # secondary text

# ── SHADOW ───────────────────────────────
shadow:
  recipe:  "soft grey offset (#DCE3EC), never black — depth without weight"
  default: "+6px"
  small:   "+4px"

# ── STROKE & CORNERS ──────────────────────
stroke:
  primary: "3px solid indigo (#635BFF)"
  radius: 8
---

# Stripe — Feishu SVG Whiteboard Design System

Navy ink on a near-white ground, with indigo doing the structural work — outlines, connectors, and the one colour that ties the board together. Two pale tints (lavender, sky) lift panels off the canvas; the recessed mist breaks long white runs. Shadows are soft grey, not black: present, never heavy.

## Color

**canvas** (`#F6F9FC`) is the ground; **navy** (`#0A2540`) is every heading and label; **indigo** (`#635BFF`) is the outline/connector accent. **lavender** and **sky** tint accent panels (use one per panel, never both in one cell); **mist** (`#EDF1F7`) is the recessed neutral; **slate** (`#425466`) is secondary text.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
