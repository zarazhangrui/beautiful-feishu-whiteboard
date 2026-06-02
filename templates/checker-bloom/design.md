---
version: 1.0
name: Checker Bloom
renderer: feishu-svg-whiteboard
description: >
  A playful, hand-painted folk palette taken from a gouache still life: a pale mint-green page with
  two confident accents, a cobalt blue and a grass green, plus warm-black ink. Cheerful and
  naive-art, like a painted poster of blue blooms. Flat color only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  mint:  "#E8F1DD"   # universal canvas: pale yellow-green, soft and painterly, never white
  ink:   "#151515"   # all text, borders, and rules
  blue:  "#2C6EE0"   # primary accent: cobalt. Hero fills, key blocks, the loudest note
  green: "#5E9E4A"   # secondary accent: grass green. Supporting fills, dividers, stems-equivalent
  white: "#FFFFFF"   # card fills, and a large-bold text option on blue
  # Mint page + two accents (cobalt blue, grass green). Use blue as the lead and green as support,
  # two accents per scene. No red, no third accent.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "Text is ink on the mint page and on white cards. On a blue or green fill, use large bold white."
  note: "Large bold white text on the cobalt blue reads well on the live board. The image export renders text color unreliably, so judge color via --output_as raw or the live board, not the exported PNG."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "2 to 3px solid ink for cards and panels; many fills can be borderless flat color"
  rule:       "2px solid ink for dividers"
  radius:     "soft (rx 10 to 20) suits the hand-painted mood; sharp (rx 0) for a crisp block"
---

# Checker Bloom — Feishu SVG Whiteboard Design System

A pale mint page with cobalt-blue and grass-green accents and warm-black ink. The mood is a
hand-painted folk still life: cheerful, naive, and confident. Lead with the cobalt blue, support with
the green, and keep the page mint and airy.

## Color

- **Mint** (`#E8F1DD`): The universal canvas. A pale yellow-green, soft and painterly. The default background, never white.
- **Ink** (`#151515`): Warm near-black. All text, borders, and rules.
- **Blue** (`#2C6EE0`): Cobalt. The primary accent: hero fills, key blocks, the boldest note on the page. Lead with it.
- **Green** (`#5E9E4A`): Grass green. The secondary accent: supporting fills, dividers, and the green that pairs with the blue.
- **White** (`#FFFFFF`): Card fills, and a large-bold text option on the cobalt blue.

Use two accents per scene, blue leading and green supporting, on the mint page. Text stays in ink on
mint and white, and switches to large bold white on a blue or green fill.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
