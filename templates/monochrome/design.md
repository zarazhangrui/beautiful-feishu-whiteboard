---
version: 1.0
name: Monochrome
renderer: feishu-svg-whiteboard
description: >
  A single-surface editorial palette with no accent color at all. A warm off-yellow cream is the
  only canvas, a very dark olive-black is every text run, border, and divider, and two graphite
  tones handle secondary and tertiary copy. That is the whole system. Quiet, restrained, and
  text-first: distinction comes from scale, weight, and spacing, never from color. Flat only, no
  gradients or shadows.

# ── COLOR ────────────────────────────────────────────────────
colors:
  cream-paper: "#FAFADF" # the default surface: warm off-yellow cream, never white
  cream-paper-2: "#F2F2D2" # a slightly deeper cream for inset surfaces; barely perceptible
  cream-paper-3: "#F0F0D4" # a slightly more saturated cream to mark a placeholder or void rectangle against the surface
  cream-warm: "#F5F0E4" # a warmer cream that signals a related sub-section surface / a different kind of scene within the board
  ink-black: "#1A1A16" # ALL text, rules, dividers, borders, non-decorative fills; a very dark olive-black (not pure black), chosen for warmth against the cream
  ink-graphite: "#5E5E54" # secondary text: muted leads, body copy, labels that step back from headline weight
  ink-graphite-light: "#8A8A80" # tertiary text: kickers, axis labels, source notes, markers that read as barely-present structure
  # No accent. The cream siblings are nearly identical: vary surfaces by padding, scale and serif-weight title,
  # not by color. Ink-black carries everything structural.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "1 to 2px solid ink-black for panels and rules"
  rule: "1px solid ink-black for dividers"
  radius: "low to none (rx 0 to 6); the look is quiet and squared"
---

# Monochrome — Feishu SVG Whiteboard Design System

One cream surface, one near-black ink, two greys. No accent. The restraint is the design: build the
board so hierarchy comes from size, weight, and space, and let the warm cream and the olive-black ink
do all the work. Reach for this when the content should feel quiet, serious, and uncluttered.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
