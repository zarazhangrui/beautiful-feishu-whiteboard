---
version: 1.0
name: Papier Bleu
renderer: feishu-svg-whiteboard
description: >
  A calm two-tone system in the spirit of Matisse's papiers découpés — soft aqua color-blocks on warm cream, with deep-blue type. Breezy, gallery-calm; depth comes from flat color and generous negative space, not grids or shadows. The softness is carried by rounded-rectangles, circles, and ellipses (the board's native soft shapes) — not freeform cut-outs. Flat color only (no gradients, no shadows). Built for gentle explainers, journeys, calm overviews, and boards that should feel artful rather than technical.

# ── COLOR ────────────────────────────────────────────────────
colors:
  cream: "#FAF3EB" # warm ivory — the canvas and the "negative" space
  aqua: "#72D0E9" # sky aqua — the hero color-blocks (the "paper")
  aqua-2: "#4FB8D8" # one step deeper aqua — for layering one block over another
  navy: "#1A3C8F" # deep blue — ALL type, plus fine accents (thin rules, small dots)
  # Two-tone (cream + aqua) carried by SHAPE; navy is the ink. Calm, never loud — let it breathe.
  # Rule: keep it to 2–3 elements per scene; let one large aqua block anchor and give room to breathe.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "All text is NAVY (a deep saturated blue — renders true). Navy reads on both cream and aqua."
  note: "Text color isn't restricted on the board; navy is the design choice. (To check a text color, use --output_as raw or the live board — the image export renders text color unreliably.)"

# ── DEPTH ────────────────────────────────────────────────────
# FLAT — no shadows, no gradients. Depth = overlapping color-blocks (aqua over aqua-2), role-swaps, scale, and open space.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "0 — shapes are flat fills, no border by default"
  rule: "2px solid navy — optional quiet hairline accent only"
  radius: "high rounded (rx ≥ 24) for the soft feel — OR sharp (rx 0) when a crisp block is wanted; both are native. NOT 'organic' — the soft look comes from circles, ellipses, and rounded-rects."
---

# Papier Bleu — Feishu SVG Whiteboard Design System

Matisse cut-outs, rebuilt in the board's native vocabulary. A warm cream page, big soft aqua
blocks, and calm deep-blue type. Soft, asymmetric, airy — an art print, not a diagram. Let one
large aqua block anchor the board and give everything room to breathe.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
