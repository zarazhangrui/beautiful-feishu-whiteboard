---
version: 1.0
name: Salmon Stamp
renderer: feishu-svg-whiteboard
description: >
  A neobrutalist stamp system on a warm salmon canvas. Big black-outlined frames hold oversized green display letterforms, and a flat black backer panel sits offset behind each block to read as hard depth — never a shadow, always a solid role-swapped panel. Ink is pure black; the one loud accent is a saturated green. The register is heavy, squared, all-caps and confident. Built for explainers, processes, comparisons, and bold system maps that want a poster-like punch.

# ── COLOR ────────────────────────────────────────────────────
colors:
  salmon:  "#F0AE9E"   # warm salmon-peach — the canvas
  ink:     "#000000"   # pure black — frames, ALL structure, backer panels, body text
  green:   "#049550"   # saturated grass-green — the single loud accent: display letters, numerals, fills
  green-2: "#04964E"   # one step of green (near-identical) — secondary green fills if two greens needed
  paper:   "#FFFFFF"   # clean white — small-text panels that need maximum contrast
  # ONE accent per scene (green) over salmon + black ink. The green-on-salmon clash IS the identity.

# ── TEXT COLOR (critical on a colored canvas) ────────────────
text-rules:
  on-salmon: "BLACK (ink) for any size — always reliable. GREEN only for LARGE display (≥ ~40px). Never small green text on salmon (low contrast)."
  on-ink:    "SALMON or WHITE for LARGE/bold text; never small body on black — move small text to a salmon or white panel."
  on-white:  "BLACK text — always crisp. Best home for any small body/label."
  on-green:  "BLACK text — always crisp."

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — NO shadows of any kind (not blurred, not the duplicate-offset trick).
# The signature "offset block" is a SOLID black backer panel placed behind a forward panel —
# a panel role-swap, not a shadow. Depth = flat color blocks, black frames, backer panels, scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  frame:  "4px solid ink"    # the square outline frame around hero/stamp blocks
  border: "3px solid ink"    # cards, banners, step boxes
  rule:   "3px solid ink"    # divider lines
  radius: 0                  # everything squared — hard corners are the whole point
---

# Salmon Stamp — Feishu SVG Whiteboard Design System

A neobrutalist poster you can read across the room. A warm salmon field, black-outlined square
frames, oversized green stamped letterforms, and a flat black backer panel offset behind each
block to fake the hard "drop" of brutalist print — without any shadow.

## Color

The **salmon field** (`#F0AE9E`) is the canvas. **Ink** (`#000000`) is the structural color —
every frame, border, divider, backer panel, and all body/label text. **Green** (`#049550`) is the
single loud accent: the oversized stamp letters, big numerals, and a few key fills. **White**
(`#FFFFFF`) is the high-contrast home for any small body text. Use only **one accent per scene** —
the green-on-salmon clash is the whole identity; do not dilute it with extra hues. A near-identical
`#04964E` exists only if you genuinely need two greens to abut.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
