---
version: 1.0
name: Cobalt Pop
renderer: feishu-svg-whiteboard
description: >
  A high-impact brand palette: deep navy ink on pure white, structured by an electric #2D5BFF
  cobalt outline and grounded by hard navy offset shadows. Coral and cobalt accent panels add pop.
  Confident and punchy while staying clean enough for a leadership deck.

# ── COLOR ────────────────────────────────
colors:
  navy:           "#0A1F44"   # primary text & structure
  white:          "#FFFFFF"   # canvas + default cell
  cobalt:         "#2D5BFF"   # electric outlines & connectors
  coral:          "#FFE2D8"   # accent panel A — warm coral tint
  cobalt-tint:    "#DCE6FF"   # accent panel B — cool cobalt tint
  mist:           "#EFF3F9"   # neutral recessed cell
  steel:          "#33415C"   # secondary text

# ── SHADOW ───────────────────────────────
shadow:
  recipe:  "hard navy offset (#0A1F44) — a solid block for punch"
  default: "+6px"
  small:   "+4px"

# ── STROKE & CORNERS ──────────────────────
stroke:
  primary: "3px solid cobalt (#2D5BFF)"
  radius: 0
---

# Cobalt Pop — Feishu SVG Whiteboard Design System

Punchy but disciplined. Electric cobalt outlines and hard navy offset shadows give the board energy and depth; warm coral and cool cobalt tints pop the key panels. White ground keeps it from getting loud — confident, not chaotic.

## Color

**white** ground; **navy** (`#0A1F44`) text; **cobalt** (`#2D5BFF`) outline/connector + energy. **coral**/**cobalt-tint** pop accent panels; **mist** recessed neutral; **steel** (`#33415C`) secondary text. Shadows are solid navy for punch.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
