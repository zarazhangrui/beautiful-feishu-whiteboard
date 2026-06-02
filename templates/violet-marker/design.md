---
version: 1.0
name: Violet Marker
renderer: feishu-svg-whiteboard
description: >
  A friendly highlighter palette on a white page: a bright lavender-violet and an acid lime-green as
  the two accents, with black type. Violet does the colour-blocks (header bands, chips); lime is the
  single highlighter punch (a marker block behind a keyword, accent ticks, an underline). Black carries
  the type; a warm grey softens body copy. Clean, modern, and airy: colour-blocks and whitespace do the
  structure, not heavy frames. Flat color only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  white:  "#FFFFFF"   # universal canvas: clean white page
  violet: "#C5A1FF"   # bright lavender-violet: the main accent — header bands, chips, colour blocks (light enough for black text)
  lime:   "#CFEE30"   # acid lime-green: the single highlighter PUNCH — a marker block behind a keyword, accent ticks, an underline
  ink:    "#000000"   # black: all headlines, labels, and structural rules
  slate:  "#666463"   # warm grey: body / paragraph text on white
  # White page + two accents. Violet carries the colour-blocks; lime is the one highlighter punch.
  # Black is the type. Keep it airy; one lime highlight per scene, not many.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "Text is black (or slate for body) on white and on violet. Lime is only a highlighter fill behind black text or a small mark, never text itself."
  note: "Black text on violet reads fine on the live board. The image export renders text color unreliably, so judge color via --output_as raw or the live board, not the exported PNG."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "minimal. Prefer violet colour-blocks and thin rules over heavy frames; no big outer frame"
  rule:       "thin violet or lime rules for row dividers"
  radius:     "low (rx 0 to 10); clean and modern"
---

# Violet Marker — Feishu SVG Whiteboard Design System

A clean white page with bright violet colour-blocks and one acid-lime highlighter. Lead with black
type, let the violet header bands and chips carry the structure, and spend the lime on a single
highlighter move (a marker block behind a keyword, an underline, a few ticks). Keep the white open and
airy, not boxed-in.

## Color

- **White** (`#FFFFFF`): The universal canvas. Clean and open. The default background.
- **Violet** (`#C5A1FF`): Bright lavender-violet. The main accent: stage header bands, chips, and colour blocks. Light enough that black text reads on it.
- **Lime** (`#CFEE30`): Acid lime-green. The single highlighter punch: a marker block behind a keyword, an accent underline, small ticks. Very light, so use it as a fill behind black text, never as text.
- **Ink** (`#000000`): Black. All headlines, labels, and the few structural rules.
- **Slate** (`#666463`): Warm grey. Body and paragraph text on white, where pure black would be too heavy.

Two accents on a clean white page: violet for the blocks, lime for one highlighter punch. Text is black
or slate; the violet and lime are fills and marks, not text.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
