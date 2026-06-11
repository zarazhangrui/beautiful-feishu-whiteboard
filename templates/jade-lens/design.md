---
version: 1.0
name: Jade Lens
renderer: feishu-svg-whiteboard
description: >
  A calm, harmonious system built on a warm putty canvas and large solid jade-emerald ellipses, where two ellipses overlapping produce a third deeper-green "lens" ellipse in the intersection rather than a transparency. Depth and structure come from flat color blocks, ellipse-on-ellipse overlap, and quiet generous whitespace — no shadows, no chrome, borders only when a divider is genuinely needed. Type is a heavy near-black display set sparingly beside the ellipses or in the margins. Best for serene system maps, concept overviews, two-part comparisons, and slow-paced explainers where the geometry carries the meaning and labels stay minimal.

# ── COLOR ────────────────────────────────────────────────────
colors:
  canvas: "#F5F1EE" # canvas / warm putty background everywhere behind the composition; carries dark ink text well; also the light label color set on top of jade/lens fills
  ink: "#1E2421" # ink / near-black structure & display text (warm charcoal); the occasional rule and any connector
  jade: "#2BA483" # accent-1 / primary emerald ellipse; use side by side with jade-mint so meeting shapes read as distinct masses
  jade-mint: "#2CAE8C" # accent-2 / second, slightly lighter-mint ellipse; pair with jade as the two primary masses
  lens: "#08754C" # accent-3 / THE signature move — deep-green OVERLAP ellipse painted as its own solid shape in the intersection (fakes a multiply blend on a board that ignores opacity)
  lens-soft: "#0E5A3C" # accent-4 / deepest jade, reserved for big numerals and emphasis text in margins
  # Rule: 2–3 accents per scene (typically both jades + the lens). Harmonious, quiet, all-green family.
  #       Dark ink text on putty canvas; light putty (#F5F1EE) text only on saturated jade/lens fills (never dark-green text on a green ellipse — the low-contrast trap). Keep small labels on putty or in a light panel.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. The composition reads "layered" because two
# solid ellipses overlap. Opacity is IGNORED here, so depth = three SOLID color blocks:
# the two jade ellipses plus a deeper "lens" ellipse painted as its OWN shape in the overlap zone.
# Further depth from scale (huge ellipses vs small labels) and panel role-swaps — never a shadow.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "none" # ellipses are borderless by default — the fill edge is the edge
  rule: "3px solid #1E2421" # when a divider/connector is needed, bump hairlines to 3px
  radius: 0 # rects are sharp by default; rounded info panels use rx 16–24. Never "organic".
---

# Jade Lens — Feishu SVG Whiteboard Design System

A serene system of large jade ellipses on warm putty, where two ellipses meeting produces a third deeper-green "lens" ellipse in the intersection instead of a transparent blend. Quiet, minimal, native-shape — the geometry does the talking.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
