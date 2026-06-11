---
version: 1.0
name: Grove Block
renderer: feishu-svg-whiteboard
description: >
  A warm-cream neobrutalist system built from flat, saturated color-blocks
  framed by a single heavy forest-green border. Cards abut inside one big
  rounded green frame, each a solid block of pink, gold, or green; type is a
  punchy heavy-weight grotesque in deep green or cream. Depth is entirely
  flat — borders, panel role-swaps, and scale, never shadows. Good for
  product explainers, feature grids, comparisons, and friendly system maps
  that want a loud, playful, brand-forward voice.

# ── COLOR ────────────────────────────────────────────────────
colors:
  cream: "#F7F1EC" # canvas / background, warm putty; carries dark (deep-green) body text
  forest: "#008248" # ink / structure — every border, display headline, primary CTA fill; carries cream (reversed) text
  deep: "#01623F" # accent-1 — darker green for role-swapped banner panels and reversed cards; carries cream text
  pink: "#F6BDDA" # accent-2 — soft hero card fill; carries dark green body text
  gold: "#FCC715" # accent-3 — display/button & streak-card fill, loud highlight; large CTA labels & graphic streaks only, never small dark-on-gold body text
  cream-lt: "#FCF6F1" # accent-4 — near-white card fill for body-text panels; carries dark green body text
  # Rule: 2–3 accents per scene (pink+gold, or green+gold) — loud, cheerful clash against forest is the point.
  # Text contrast is strict: deep-green text on cream/pink/cream-lt; cream text only on forest or deep fills.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = flat color blocks, heavy green borders,
# panel role-swaps (cream→forest), and scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "4px solid #008248"
  rule: "2px solid #008248"
  radius: 18 # generous soft-rounded corners on the outer frame and cards
---

# Grove Block — Feishu SVG Whiteboard Design System

A loud, friendly neobrutalism: warm-cream canvas, one heavy forest-green frame, and
flat color-blocked cards in pink, gold, and green. Bold and brand-forward, but fully flat.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
