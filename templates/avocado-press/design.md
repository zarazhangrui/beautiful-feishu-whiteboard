---
version: 1.0
name: Avocado Press
renderer: feishu-svg-whiteboard
description: >
  An editorial two-tone color-combo system built on a single loud clash — pale avocado lime against deep French blue. Each scene is a stack of full-bleed solid color bands, no borders, where one band's fill becomes the next band's text color (role-swap). Type is a quiet/elegant register — large, calm display lines plus tiny UPPER tracked spec tags reading like a swatch card. Color does all the work; depth is pure flat color-blocking. Best for comparisons, paired concepts, before/after, and palette/spec breakdowns.

# ── COLOR ────────────────────────────────────────────────────
colors:
  avocado: "#DCF4A2"   # canvas / band-A fill — pale lime (ref-labeled #DCF4A2; sampled #DDF4A2)
  french:  "#0055A4"   # band-B fill / ink-on-avocado — deep French blue (sampled #0055A6)
  ink:     "#0157A4"   # display + label text when on avocado (the blue, used as ink)
  paper:   "#DCF4A2"   # display + label text when on french (the lime, used as ink) — same as avocado
  # Two hues only. They TRADE roles band to band: blue is ink on lime, lime is ink on blue.
  # Rule: 2 colors, used loudly and exclusively. No third accent. Always dark-enough text on its band.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = full-bleed solid bands, color role-swaps between bands, scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "0 — bands abut flush, no borders; the color edge IS the divider"
  rule:       "3px solid <opposite band color>"   # only when a hairline is truly needed inside a band
  radius: 0
---

# Avocado Press — Feishu SVG Whiteboard Design System

A duotone editorial color-combo board: full-bleed avocado-lime and French-blue bands stacked flush, where each band speaks in the other band's color. Calm, large type; tiny tracked spec tags. No borders, no shadows — the color edge does everything.

## Color
Exactly **two hues, used loudly and exclusively**: pale **avocado** `#DCF4A2` and deep **French blue** `#0055A4`. There is no third accent — restraint is the identity. The structural move is a **role-swap**: on an avocado band, all type and rules are blue (`#0157A4`); on a blue band, all type and rules are lime (`#DCF4A2`). Both pairings clear strong contrast in both directions, so display text, body text, and small spec tags are all safe on either fill. Because there are no borders, the **color boundary between two flush bands is the only divider** — keep band fills fully saturated and edges hard. Never put avocado text on a lighter avocado or blue-on-blue; text always reads in the opposite hue.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
