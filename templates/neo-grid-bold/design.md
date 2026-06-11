---
version: 1.0
name: Neo-Grid Bold
renderer: feishu-svg-whiteboard
description: >
  A heavy editorial poster system built on a strict block grid with one neon-lemon accent on putty-ecru. Display type is bold uppercase; labels read as monospace-style metadata tags. Each board reads as a magazine spread divided into colored panels — paper-ecru, ink-black, and electric lemon trading roles across cells. Flatness is the point: no shadows, no rounded corners. Borrows from contemporary editorial print, brutalist annual reports, and populist design-week posters.

# ── COLOR ────────────────────────────────────────────────────
colors:
  paper: "#F5F4EF" # putty-ecru — default panel + canvas
  bg: "#ECECE8" # one step darker, recessed panels
  ink: "#0A0A0A" # ink-black panels, rules, text
  lemon: "#E6FF3D" # the single electric accent — use for one or two panels or a stat to make the spread snap
  muted: "#8A8A85" # secondary text / footnotes
  # THREE roles trade places across panels: paper, ink, lemon. Exactly one accent — lemon.
  # On ink panels, text is paper or lemon; on paper/lemon panels, text is ink.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  rule: "3px solid ink" # grid lines between panels; hairline rules
  thick: "4px solid ink" # outer frame / emphasis
  radius: 0 # squared corners always

# ── SHADOW ───────────────────────────────────────────────────
shadow:
  none: true # flatness is the identity — panels tile, they do not float. No offset shadows.
---

# Neo-Grid Bold — Feishu SVG Whiteboard Design System

A magazine spread, not a slide. Tile the board into a strict grid of rectangular panels;
let paper-ecru, ink-black, and one electric lemon trade roles across the cells. Oversized
numerals fill panels; monospace-style tags label the margins. Dead flat — no shadows.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
