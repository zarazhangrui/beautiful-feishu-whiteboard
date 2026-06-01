---
version: 1.0
name: Crayon Stack
renderer: feishu-svg-whiteboard
description: >
  A loud poster system in primary-school crayon brights on pure white, built from clean native shapes. Flat saturated color-blocks — rectangles, rounded-rects, and circles — abut and lean (via a slight `rotate()`) like books tipping on a shelf. Display type is heavy, all-caps, tightly stacked vermilion; block labels run vertically (rotated 90°) in contrasting hues. Built for explainers, taxonomies, "stacks" of options, and playful comparisons where energy and clash matter more than restraint.

# ── COLOR ────────────────────────────────────────────────────
colors:
  white:      "#FFFFFF"   # canvas — pure white, generous and empty
  vermilion:  "#FF472B"   # ink / primary — title type, hero block, big numerals, connectors
  chartreuse: "#D3FE79"   # accent — large lime color-block (hero fill)
  pine:       "#2A8F6D"   # accent — deep green block, carries light text
  periwinkle: "#7E90FC"   # accent — soft blue block, carries dark or red text
  maroon:     "#8A2E43"   # accent — oxblood block, carries chartreuse or white text
  pink:       "#FBB8FD"   # accent — pale pink block, carries dark/maroon text
  # Rule: maximalist — use ALL the brights loudly, leaned together, on white. Let hues clash, not harmonize.
  # Vermilion is the connective ink. Dark text on light fills (pink/periwinkle/chartreuse); light text on dark (pine/maroon).

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = flat color blocks, slight rotation, abutting/overlapping rects, scale, and panel role-swaps. Blocks tip flush like books on a shelf.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "none"          # blocks are flat solid fills; the color edge against white reads as the border
  rule:       "4px solid #FF472B"   # rare — only when a true divider rule is needed
  radius: 0   # hard square corners by default; an optional rounded `rx` is the only allowed exception — never "organic"
---

# Crayon Stack — Feishu SVG Whiteboard Design System

A clean native-shape poster medium: pure-white canvas, fistfuls of clashing crayon brights, and flat color rectangles that tip and abut like a shelf of books. Hierarchy is pure color and scale — never a line, never a shadow. Everything is a rectangle, rounded-rect, or circle.

## Color
Pure-white canvas (`#FFFFFF`) — kept genuinely empty so the brights pop. **Vermilion `#FF472B`** is the connective ink: title type, the hero block, big numerals, and the rare divider rule and connectors. The accent set is a deliberately **clashing** crayon spread — chartreuse `#D3FE79`, pine `#2A8F6D`, periwinkle `#7E90FC`, maroon `#8A2E43`, pink `#FBB8FD`. This is the **maximalist exception**: use all of them loudly in one scene, leaned and abutting, letting hot/cool and light/dark fight rather than harmonize. The reference's only restraint is the empty white field around the cluster — preserve it.

Text contrast is non-negotiable: dark/maroon text on light fills (white, pink, periwinkle, chartreuse); white or chartreuse text on dark fills (pine, maroon). Never put small text on a same-hue fill.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
