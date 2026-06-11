---
version: 1.0
name: Long Table
renderer: feishu-svg-whiteboard
description: >
  A warm single-ink palette in the spirit of a printed menu or recipe card. One buttery cream is the
  only surface, and one rust terracotta is the only ink: every text run, border, rule, pill outline,
  and page number is that single warm red. Cozy, rustic, and confidently monochrome. Flat color only,
  no gradients or shadows.

# ── COLOR ────────────────────────────────────────────────────
colors:
  paper: "#FAF1E2" # the only surface / default background: warm buttery cream, reads as good paper stock, between white and beige; the only background fill the system uses
  paper-d: "#F2E5CF" # a slightly darker cream for secondary surfaces or tonal separation; sparing
  paper-vd: "#E8D7B6" # a deeper cream for an accent surface; reserved
  ink: "#B53D2A" # the single ink: warm rust terracotta — ALL text, borders, rules, pills, numbers; the structural AND expressive color of the system
  ink-dp: "#8E2D1F" # a deeper rust for emphasis; reserved, used sparingly
  rule: "#B53D2A" # alias of ink (same hex), named when referring to a rule line semantically
  # One surface, one ink. The whole identity is buttery cream plus a single rust terracotta.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "All text is rust terracotta (ink, #B53D2A), a saturated warm red. It is the only ink color: text, borders, rules, pills, and page numbers are all this one hue."
  note: "This is a distinctive non-black text color. The image export renders text color unreliably, so judge it via --output_as raw or the live board, not the exported PNG."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "1 to 2px solid ink (rust) for every border, frame, and pill outline"
  rule: "1px solid ink (rust) for dividers and table rules"
  radius: "low to none (rx 0 to 8); the look is a ruled paper table"
---

# Long Table — Feishu SVG Whiteboard Design System

One cream, one rust. The whole board is a buttery cream page marked entirely in a single warm
terracotta: every line of text, every border, every rule, every pill, every page number is the same
rust red. The constraint is the charm, like a well-set printed menu. Build with the one ink and let
weight, scale, and ruled lines carry the structure.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
