---
version: 1.0
name: Linear
renderer: feishu-svg-whiteboard
description: >
  A restrained, near-monochrome system inspired by Linear: woodsmoke ink on an almost-white
  canvas, structured by a single #5E6AD2 indigo outline. Maximum calm, minimum colour — the
  product-design house aesthetic. Pale grey shadows keep it weightless.

# ── COLOR ────────────────────────────────
colors:
  woodsmoke:      "#1C1C22"   # primary text & headings
  paper:          "#FBFBFD"   # canvas + default cell fill
  indigo:         "#5E6AD2"   # cell outlines & connectors — the only accent
  haze:           "#E8E8F4"   # accent panel A — faint indigo wash
  fog:            "#EEEEF4"   # accent panel B — faint cool grey
  smoke:          "#F2F2F6"   # neutral recessed cell
  oslo:           "#56565F"   # secondary text

# ── SHADOW ───────────────────────────────
shadow:
  recipe:  "pale grey offset (#E6E6EE), never black"
  default: "+6px"
  small:   "+4px"

# ── STROKE & CORNERS ──────────────────────
stroke:
  primary: "3px solid indigo (#5E6AD2)"
  radius: 8
---

# Linear — Feishu SVG Whiteboard Design System

Almost monochrome on purpose. Woodsmoke text on near-white, one indigo outline, and two whisper-faint washes for the few panels that need to lift. The discipline is the design: let whitespace and a single accent carry the hierarchy.

## Color

**paper** (`#FBFBFD`) ground; **woodsmoke** (`#1C1C22`) text; **indigo** (`#5E6AD2`) the single outline/connector accent. **haze**/**fog** are barely-there panel tints; **smoke** the recessed neutral; **oslo** (`#56565F`) secondary text.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
