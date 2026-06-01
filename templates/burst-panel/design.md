---
version: 1.0
name: Burst Panel
renderer: feishu-svg-whiteboard
description: >
  A loud neobrutalist dashboard system — a saturated marigold-yellow canvas carved into big lavender panels and near-black ink cards, all bound by chunky black borders with squared-to-soft corners. Type is heavy and plain (no caps gimmickry), the structural signature is flat color-blocking plus role-swapped nested panels and oversized numeral cells, and color does the shouting while ink does the holding. Great for product/system maps, dashboards-as-diagrams, feature comparisons, and pricing/plan explainers that want energy without clutter.

# ── COLOR ────────────────────────────────────────────────────
colors:
  canvas:    "#FBD65A"   # marigold-yellow canvas / background
  ink:       "#1E1E1E"   # near-black ink: borders, dark cards, structure, big numerals
  panel:     "#CFACE8"   # lavender — major content panels sit on the yellow
  violet:    "#BD89E4"   # deep violet — secondary band / role-swap fill
  mint:      "#AAE4BA"   # mint-green accent — active/selected pills, "go" states
  orange:    "#FFA76D"   # orange — action buttons, stamps, call-to-action dots
  cream:     "#FFFAF0"   # cream — high-contrast surface for small text & light cards
  # Rule: 2–3 accents per scene (mint OR orange as the "live" accent; lavender+violet as the
  # structural pair). Dark ink text on cream/lavender/mint/yellow; cream/yellow text only on ink/violet.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = flat color blocks, chunky borders, panel
# role-swaps (lavender panel → ink sub-card → cream inner card), and scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "4px solid #1E1E1E"   # panels, cards, the board frame
  rule:       "2px solid #1E1E1E"   # dividers, pill outlines, connector lines
  radius: 18  # generously rounded rects/pills
---

# Burst Panel — Feishu SVG Whiteboard Design System

A high-energy neobrutalist dashboard look: marigold canvas, fat black borders, lavender and ink panels nested by role-swap, mint/orange accents for "live" states, and oversized numeral cells as the graphic punctuation. Everything is flat and editable.

## Color

Seven roles. **`canvas` (#FBD65A)** is the loud yellow ground everything sits on — reserve it for large fields and graphic shapes, never small labels. **`ink` (#1E1E1E)** does all the structural work: every border, every divider, and the dark "feature" sub-cards. **`panel` (#CFACE8)** is the lavender that carves the canvas into major content zones; **`violet` (#BD89E4)** is its deeper sibling for a secondary band or a role-swapped panel. **`mint` (#AAE4BA)** and **`orange` (#FFA76D)** are the two "live" accents — mint for selected/active/go states, orange for actions, stamps, and CTA dots; use only one as the dominant accent per scene. **`cream` (#FFFAF0)** is the safe high-contrast surface for any body text or small labels.

Temperature is warm-loud (marigold + orange) cooled by the lavender/mint pair — it clashes on purpose. Contrast pairing: **dark ink text** on cream, lavender, mint, and yellow; **cream or yellow text** only on ink or violet fills. Never put small dark text on violet (too low-contrast) — promote it to a cream inner card.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
