---
version: 1.0
name: Linen Cut
renderer: feishu-svg-whiteboard
description: >
  A mid-century modernist color-block system in the spirit of Eames-era Herman Miller and Phaidon monographs — a warm natural-linen ground holding a few bold flat blocks and discs in true primary blue, green, and red, with crisp near-black type set top-left. Calm, confident, and graphic; vast negative space and three loud-but-flat primaries do all the work. No grids, no shadows, no chrome — depth is pure color-blocking and scale. Built for cover-style hero boards, manifestos, big-idea explainers, and three-way comparisons that should feel like a gallery print, not a diagram.

# ── COLOR ────────────────────────────────────────────────────
colors:
  linen: "#E4D2C4" # canvas — warm putty/oatmeal cloth, the page AND the negative space around each block
  ink: "#1F1A14" # ink/structure — warm near-black; ALL type plus the occasional 2–3px structural rule; big display numerals may sit beside a block in their own zone
  blue: "#044D99" # accent-1 — primary cobalt block (flat fill, SHAPE color)
  green: "#04B24F" # accent-2 — primary grass-green block (flat fill, SHAPE color)
  red: "#F61B27" # accent-3 — primary red block (flat fill, SHAPE color)
  # Rule: the three primaries are a TRIAD — Triad mode: all three blocks together as the hero composition; OR
  # Single-accent mode: pick ONE primary as the scene's hero block, rest of the board ink-on-linen. Loud but balanced, flat and separated by linen — never muddied. Ink for ALL type. Dark text on linen / on light fills.
  # The primaries are SHAPE colors; keep small labels on linen, never set small text on a block fill (low-contrast, noisy).

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "All text is INK (#1F1A14, warm near-black). Reads crisply on the linen canvas."
  note: "Text color isn't restricted on the board; ink is the design choice. (To check a text color, use --output_as raw or the live board — the image export renders text color unreliably / often black.)"

# ── DEPTH ────────────────────────────────────────────────────
# FLAT — no shadows, no gradients. Depth = flat saturated color-blocks (rects + discs),
# scale contrast (huge block vs small label), and open linen space. Never a shadow.

# ── SHAPE & CORNERS ──────────────────────────────────────────
shape:
  language: "NATIVE COLOR-BLOCKING. Bold flat fields built from `<rect>` (sharp or rounded `rx`), `<circle>`, and `<ellipse>` — primary-colored blocks, discs, and pills read as cut-paper-style foreground against linen. Clean geometric containers and badges from the same primitives."
  corners: "Containers are squared or lightly rounded (rx 0–8) — modernist, not playful. Drama lives in scale and saturation of flat blocks, never in fancy curves."
  borders: "Mostly none — primaries are flat fills. A 2–3px ink hairline is allowed as a quiet structural accent (e.g. a baseline rule under the title or a card edge)."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "3px solid ink"
  rule: "2px solid ink"
  radius: 0 # squared by default; rx ≤ 8 on the rare rounded card
---

# Linen Cut — Feishu SVG Whiteboard Design System

A Herman Miller / Phaidon book cover as a whiteboard. A warm linen page, a few bold flat blocks
and discs in primary blue, green, and red, and crisp near-black type set flush top-left.
Three loud flat colors, vast calm space, zero ornament — let one block or a trio carry the board
and give the type room to breathe.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
