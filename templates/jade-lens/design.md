---
version: 1.0
name: Jade Lens
renderer: feishu-svg-whiteboard
description: >
  A calm, harmonious system built on a warm putty canvas and large solid jade-emerald ellipses, where two ellipses overlapping produce a third deeper-green "lens" ellipse in the intersection rather than a transparency. Depth and structure come from flat color blocks, ellipse-on-ellipse overlap, and quiet generous whitespace — no shadows, no chrome, borders only when a divider is genuinely needed. Type is a heavy near-black display set sparingly beside the ellipses or in the margins. Best for serene system maps, concept overviews, two-part comparisons, and slow-paced explainers where the geometry carries the meaning and labels stay minimal.

# ── COLOR ────────────────────────────────────────────────────
colors:
  canvas:    "#F5F1EE"   # canvas / warm putty background
  ink:       "#1E2421"   # ink / near-black structure & display text (warm charcoal)
  jade:      "#2BA483"   # accent-1 / primary emerald ellipse
  jade-mint: "#2CAE8C"   # accent-2 / second, slightly lighter-mint ellipse
  lens:      "#08754C"   # accent-3 / deep-green OVERLAP ellipse (replaces transparency multiply)
  lens-soft: "#0E5A3C"   # accent-4 / deepest jade for big numerals / emphasis text
  # Rule: 2–3 accents per scene (two jades + the lens). Harmonious, quiet, all-green family.
  #       Dark ink text on putty canvas; light putty text only on the saturated jade/lens fills.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. The composition reads "layered" because two
# solid ellipses overlap. Opacity is IGNORED here, so depth = three SOLID color blocks:
# the two jade ellipses plus a deeper "lens" ellipse painted as its OWN shape in the overlap zone.
# Further depth from scale (huge ellipses vs small labels) and panel role-swaps — never a shadow.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "none"            # ellipses are borderless by default — the fill edge is the edge
  rule:       "3px solid #1E2421"  # when a divider/connector is needed, bump hairlines to 3px
  radius: 0   # rects are sharp by default; rounded info panels use rx 16–24. Never "organic".
---

# Jade Lens — Feishu SVG Whiteboard Design System

A serene system of large jade ellipses on warm putty, where two ellipses meeting produces a third deeper-green "lens" ellipse in the intersection instead of a transparent blend. Quiet, minimal, native-shape — the geometry does the talking.

## Color
The whole palette is one harmonious green family on a warm putty ground — this is a *quiet*, not loud, system. Roles:
- **canvas `#F5F1EE`** — warm putty everywhere behind the composition. Carries dark ink text well.
- **ink `#1E2421`** — warm near-black for display text, the occasional rule, and any connector.
- **jade `#2BA483`** and **jade-mint `#2CAE8C`** — the two primary ellipse fills; use the two side by side so meeting shapes read as distinct masses.
- **lens `#08754C`** — THE signature move: where two ellipses overlap, paint a third, separate, *solid* deep-green ellipse in the intersection. This is how you fake a multiply blend on a board that ignores opacity.
- **lens-soft `#0E5A3C`** — deepest jade, reserved for big numerals and emphasis text in margins.

Per scene use **2–3 accents**: typically both jades + one lens. Text contrast: dark **ink** on putty; light **putty (`#F5F1EE`)** for any label set *on top of* a saturated jade or lens fill (never dark-green text on a green ellipse — that's the low-contrast trap). Keep saturated greens for large display and graphic shapes; keep small labels on putty or inside a light panel.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
