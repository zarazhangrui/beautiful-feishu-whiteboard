---
version: 1.0
name: Catppuccin Mocha
renderer: feishu-svg-whiteboard
description: >
  A dark-canvas style from the beloved Catppuccin Mocha palette: soft lavender text on a warm
  near-black base, with mauve (#CBA6F7) carrying the outlines and gently tinted surfaces lifting
  the panels. Cozy, modern, unmistakably developer-dark. Shadows vanish into the base.

# ── COLOR ────────────────────────────────
colors:
  base:           "#1E1E2E"   # canvas — warm near-black
  text:           "#CDD6F4"   # primary text (large + bold; see RULES text-colour caveat)
  mauve:          "#CBA6F7"   # cell outlines & connectors — the signature accent
  surface-mauve:  "#322A45"   # accent panel A — mauve-tinted dark surface
  surface-blue:   "#283047"   # accent panel B — blue-tinted dark surface
  surface0:       "#313244"   # neutral recessed surface
  subtext:        "#A6ADC8"   # secondary text & lifelines
  crust:          "#181825"   # offset shadow — deepest shade, reads as a subtle edge

# ── SHADOW ───────────────────────────────
shadow:
  recipe:  "deepest shade (#181825) so the offset reads as a subtle edge, not a block"
  default: "+6px"
  small:   "+4px"

# ── STROKE & CORNERS ──────────────────────
stroke:
  primary: "3px solid mauve (#CBA6F7) — coloured outlines on the dark base"
  radius: 8
---

# Catppuccin Mocha — Feishu SVG Whiteboard Design System

A dark style. Warm near-black base, soft lavender text, and mauve outlines that glow against the dark. Panels are gently tinted surfaces (mauve / blue) rather than bright fills, so light text stays readable. Keep text large and bold per the medium's text-colour caveat; let the coloured outlines do the work.

## Color

**base** (`#1E1E2E`) canvas; **text** (`#CDD6F4`) every label — large/bold; **mauve** (`#CBA6F7`) outlines/connectors. **surface-mauve**/**surface-blue** are tinted dark panels; **surface0** the recessed neutral; **subtext** secondary text/lifelines; **crust** the (near-invisible) offset shadow.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
