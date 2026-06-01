---
version: 1.0
name: Cobalt Glaze
renderer: feishu-svg-whiteboard
description: >
  A serene blue-and-white ceramic system built entirely from native shapes: a warm matte
  off-white canvas carrying ONE loud cobalt that speaks through crisp cobalt-on-white
  rounded-rect tiles, checker grids of small squares, and circles — with a whisper of muted
  sage as relief. Structure comes from medium-weight cobalt borders and flush color-blocking,
  never shadows; type is quiet, medium-weight, sparingly all-caps. The mood is gallery-still
  and hand-printed. Good for: calm explainers, two-column comparisons, gentle process flows,
  and editorial system maps where a single confident accent should carry the whole composition.

# ── COLOR ────────────────────────────────────────────────────
colors:
  canvas:     "#ECECEC"   # canvas / cool light studio gray backdrop
  ceramic:    "#F4F2EE"   # panel / warm matte off-white "vase body" card
  cobalt:     "#185DB7"   # accent-1 / the loud primary — tiles, grids, circles, fills
  deep-cobalt: "#0D4FA8"   # ink / structure — borders, rules, connectors, dark text on ceramic
  sage:       "#8E9179"   # accent-2 / muted relief, used sparingly
  # Rule: 2 accents per scene max — cobalt is the star, sage is a quiet guest.
  # Dark text (deep-cobalt) on the light ceramic/canvas fills; light text only on solid cobalt.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = flush color blocks, cobalt borders,
# panel role-swaps (ceramic card ↔ solid-cobalt card), and scale of big numerals/circles.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "3px solid #0D4FA8"   # card & node borders
  rule:       "2px solid #185DB7"   # divider rules, grid lines
  radius: 4   # softly squared corners echoing the rounded ceramic shoulder; pills only for badges
---

# Cobalt Glaze — Feishu SVG Whiteboard Design System

A blue-and-white ceramic still-life translated to the board's native vocabulary: a quiet
off-white ground, one confident cobalt expressed through rounded-rect tiles, grids of small
squares, and circles, and a sage-green whisper for relief.

## Color

Five solids, used with restraint. The canvas (`#ECECEC`) is a cool studio gray; cards sit on
it as warm matte **ceramic** (`#F4F2EE`) panels, a soft warm/cool contrast that reads without
any border. **Cobalt** (`#185DB7`) is the single loud voice — it does double duty as flat fill,
as crisp grids of small squares, and as solid circles. **Deep-cobalt** (`#0D4FA8`) is the
structural ink: borders, rules, connectors, and dark body text on light fills. **Sage**
(`#8E9179`) is a muted guest — a small accent block, a dot, a single label — never competing
with cobalt.

Accents-per-scene: **2 max.** Cobalt always leads; sage appears at most once per scene as relief.
Dark text (deep-cobalt) sits on ceramic/canvas; **light text (ceramic/`#F4F2EE`) appears only on
solid cobalt fills.** Never put small low-contrast text (e.g. cobalt on sage, or deep-cobalt on
cobalt) — keep small text inside high-contrast ceramic panels only.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
