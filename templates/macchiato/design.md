---
version: 1.0
name: Macchiato
renderer: feishu-svg-whiteboard
description: >
  A warm monochrome palette with no accent color: a soft milky-almond page and a warm espresso
  near-black for everything, plus two warm taupe greys for quieter copy. Cozy, creamy, and
  understated, like espresso stirred into warm cream. Hierarchy comes from scale, weight, and spacing,
  never from color. Flat only, no gradients or shadows.

# ── COLOR ────────────────────────────────────────────────────
colors:
  cream: "#EDE7DD" # the default surface: warm milky almond, soft and putty, never white; every background is this or a near-identical variant
  cream-2: "#E5DECF" # a slightly deeper almond for an inset surface or placeholder; sparing, gentle difference from default
  ink: "#25211B" # ALL text, borders, rules, dividers: a warm espresso near-black, never pure #000, chosen for warmth against the almond
  ink-2: "#6E6558" # warm taupe-grey: secondary text (leads, body paragraphs, labels) that should step back from headline weight
  ink-3: "#9A917F" # pale warm taupe: tertiary text (kickers, axis labels, source notes, markers) that should read as barely-present structure
  # No accent. One warm almond surface, one espresso ink, two taupe greys. Distinguish surfaces/sections by scale, weight, padding, and a thin ink rule, not by color.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "1 to 2px solid ink for panels and rules"
  rule: "1px solid ink for dividers"
  radius: "low to soft (rx 0 to 14); quiet and warm, neither sharp nor bubbly"
---

# Macchiato — Feishu SVG Whiteboard Design System

One warm almond surface, one espresso ink, two taupe greys. No accent. The restraint is the point:
build the board so hierarchy comes from size, weight, and space, and let the milky almond and the warm
espresso ink do all the work. Reach for this when the content should feel cozy, calm, and uncluttered.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
