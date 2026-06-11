---
version: 1.0
name: Salmon Stamp
renderer: feishu-svg-whiteboard
description: >
  A clean stamp-poster palette on a white page: a warm salmon-peach and a saturated grass green as
  the two accents, with black for type and minimal structure. Salmon color-blocks (header bands,
  chips) carry the layout; green is the single loud accent (big numerals, a stamp block, key marks);
  black is the type and the few rules. Bold and characterful but airy. Use the color blocks as the
  structure, not heavy nested frames. Flat color only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  white: "#FFFFFF" # universal canvas: clean white page
  salmon: "#F0AE9E" # warm salmon-peach: the main accent — header bands, chips, color blocks
  green: "#049550" # saturated grass green: the single loud accent — big numerals, stamp block, key fills
  ink: "#000000" # black: all body/label text, plus the few rules and any minimal framing
  green-2: "#04964E" # one step of green (near-identical) — only if two greens must abut
  # White page + two accents (salmon blocks, green accent) + black type. One loud accent per scene:
  # the green-on-salmon clash is the identity. Keep it airy; let salmon blocks do the structure.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "Body and labels are black on white and on salmon. The big display numerals and the stamp block are green. White text only on the dark outcome bar."
  note: "Light text on the dark outcome bar reads on the live board. The image export renders text color unreliably, so judge color via --output_as raw or the live board, not the exported PNG."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "minimal. Prefer salmon color-blocks and thin rules over heavy frames; if a card needs an edge use a single 2px black border, not nested boxes"
  rule: "thin salmon or black rules for row dividers"
  radius: "low (rx 0 to 8); crisp, poster-like"
---

# Salmon Stamp — Feishu SVG Whiteboard Design System

A clean stamp-poster on a white page: warm salmon color-blocks, a saturated grass-green accent, and
black type. Let the salmon header bands and chips carry the structure, spend the green on the big
numerals and a stamp block, and keep the page open. Bold and characterful, but airy, not boxed-in.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
