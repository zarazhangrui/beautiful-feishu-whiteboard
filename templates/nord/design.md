---
version: 1.0
name: Nord
renderer: feishu-svg-whiteboard
description: >
  The arctic Nord palette: Polar Night ink on a Snow Storm canvas, with Frost blue (#5E81AC)
  outlines and cool Aurora-tinted panels. Calm, glacial, engineered — a restrained cool palette
  that reads as quietly technical.

# ── COLOR ────────────────────────────────
colors:
  polar:          "#2E3440"   # Polar Night — primary text & structure
  snow:           "#ECEFF4"   # Snow Storm — canvas + default cell
  frost:          "#5E81AC"   # Frost — cell outlines & connectors
  frost-teal:     "#DCE6E6"   # accent panel A — pale frost teal
  aurora-green:   "#E1E9DD"   # accent panel B — pale aurora green
  snow-deep:      "#E5E9F0"   # neutral recessed cell
  slate:          "#4C566A"   # secondary text

# ── SHADOW ───────────────────────────────
shadow:
  recipe:  "cool grey offset (#D6DCE6), never black"
  default: "+6px"
  small:   "+4px"

# ── STROKE & CORNERS ──────────────────────
stroke:
  primary: "3px solid frost blue (#5E81AC)"
  radius: 2
---

# Nord — Feishu SVG Whiteboard Design System

Cool and glacial. Polar-night ink on snow, frost-blue outlines, and two pale arctic tints for panels. Nothing shouts; the palette reads as quietly engineered — good for system maps and calm technical explainers.

## Color

**snow** (`#ECEFF4`) ground; **polar** (`#2E3440`) text; **frost** (`#5E81AC`) outline/connector. **frost-teal**/**aurora-green** tint panels; **snow-deep** is the recessed neutral; **slate** (`#4C566A`) secondary text.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
