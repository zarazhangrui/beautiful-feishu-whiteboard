---
version: 1.0
name: Tokyo Night
renderer: feishu-svg-whiteboard
description: >
  A dark-canvas style from the Tokyo Night theme: periwinkle text on a deep midnight-navy base,
  with blue (#7AA2F7) outlines and blue/purple tinted surfaces. The downtown-at-night developer
  aesthetic — deep, focused, high-tech. Offset shadows sink into the base.

# ── COLOR ────────────────────────────────
colors:
  bg:             "#1A1B26"   # canvas — midnight navy
  fg:             "#C0CAF5"   # primary text (large + bold; see RULES text-colour caveat)
  blue:           "#7AA2F7"   # cell outlines & connectors — the signature accent
  surface-blue:   "#2A2E47"   # accent panel A — blue-tinted dark surface
  surface-purple: "#2C2A47"   # accent panel B — purple-tinted dark surface
  bg-elevated:    "#24283B"   # neutral recessed surface
  comment:        "#9AA5CE"   # secondary text & lifelines
  crust:          "#15161E"   # offset shadow — deepest shade

# ── SHADOW ───────────────────────────────
shadow:
  recipe:  "deepest shade (#15161E) so the offset reads as a subtle edge, not a block"
  default: "+6px"
  small:   "+4px"

# ── STROKE & CORNERS ──────────────────────
stroke:
  primary: "3px solid blue (#7AA2F7) — coloured outlines on the dark base"
  radius: 8
---

# Tokyo Night — Feishu SVG Whiteboard Design System

A dark style. Deep midnight-navy base, periwinkle text, blue outlines that read crisply against the dark. Panels are blue/purple tinted surfaces; bright accents stay as outlines so light text remains legible. Keep text large and bold per the medium's text-colour caveat.

## Color

**bg** (`#1A1B26`) canvas; **fg** (`#C0CAF5`) every label — large/bold; **blue** (`#7AA2F7`) outlines/connectors. **surface-blue**/**surface-purple** are tinted dark panels; **bg-elevated** the recessed neutral; **comment** secondary text/lifelines; **crust** the (near-invisible) offset shadow.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
