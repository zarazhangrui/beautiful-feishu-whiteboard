---
version: 1.0
name: Specimen Bold
renderer: feishu-svg-whiteboard
description: >
  A type-specimen poster system for Feishu SVG whiteboards. Near-white paper canvas, three loud flat color-blocks (grass green, acid yellow, sky blue) used as "labels", each holding ONE heavy charcoal word at display scale. No borders by default — the saturated block IS the frame; depth comes from solid color and a few rotated blocks, never shadows. Big-word-on-a-block is the whole grammar. Built for punchy single-frame statements: category showcases, vocabulary/term maps, stage callouts, comparisons, and bold hero diagrams.

# ── COLOR ────────────────────────────────────────────────────
colors:
  paper: "#F3F3F3" # canvas background — bright off-white paper, never pure #FFF
  ink: "#2E302E" # all heavy display words, body text, rules — warm charcoal (not pure black)
  green: "#3EC06A" # accent block — grass green
  yellow: "#FBEF4A" # accent block — acid yellow (punchiest; carries ink only)
  blue: "#30A1E5" # accent block — sky blue
  # Use 2–3 accent blocks per scene. All three may co-appear (the reference stacks all three),
  # but never tile them edge-to-edge into a flag — let paper breathe between blocks.
  # Dark ink text on every accent fill (green/yellow/blue) reads crisply at display scale; use NO white/light text — always dark word on a loud block.
  # Small body text goes only inside paper-colored or light panels, never small on a saturated block.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — NO shadows of any kind (no blur, no duplicate-offset trick).
# Depth = saturated flat color blocks, the paper gap around them, a few rotated blocks, and scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "0 — blocks are borderless; the flat color is the boundary"
  outline: "3px solid ink" # OPTIONAL: only when a block sits on another color or needs a hard edge
  rule: "3px solid ink" # dividers, axes, connectors
  radius: 0 # squared rects; ellipse is the one curved primitive
---

# Specimen Bold — Feishu SVG Whiteboard Design System

A design system for building **bold single-frame statements** as editable Feishu whiteboards
written in SVG. The aesthetic is a print **type-specimen poster**: a bright paper field, three
loud flat color-blocks used like peel-off labels, and ONE heavy charcoal word centered in each.
The blocks are borderless — the saturated color is the frame. It looks designed, not templated,
and stays fully editable.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
