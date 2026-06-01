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
  cream:    "#F7F1EC"   # canvas / background, warm putty
  forest:   "#008248"   # ink / structure — borders, headlines, CTA fills
  deep:     "#01623F"   # accent-1 — darker green for banners / role-swapped panels
  pink:     "#F6BDDA"   # accent-2 — soft hero card fill
  gold:     "#FCC715"   # accent-3 — button & streak-card fill, loud highlight
  cream-lt: "#FCF6F1"   # accent-4 — near-white card fill for body-text panels
  # Rule: 2–3 accents per scene (pink+gold, or green+gold). Dark green/cream text only;
  # body text lives on cream/pink/cream-lt panels, never on the gold or deep-green fills.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = flat color blocks, heavy green borders,
# panel role-swaps (cream→forest), and scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "4px solid #008248"
  rule:       "2px solid #008248"
  radius: 18   # generous soft-rounded corners on the outer frame and cards
---

# Grove Block — Feishu SVG Whiteboard Design System

A loud, friendly neobrutalism: warm-cream canvas, one heavy forest-green frame, and
flat color-blocked cards in pink, gold, and green. Bold and brand-forward, but fully flat.

## Color
Roles: **cream** `#F7F1EC` is the canvas; **forest** `#008248` is the ink — every border, the
display headline, and the primary CTA fill. The accents are **pink** `#F6BDDA`, **gold** `#FCC715`,
and **deep** `#01623F` (a darker green used for role-swapped banner panels and reversed cards).
**cream-lt** `#FCF6F1` is the body-text card fill. Temperature is warm and high-energy; the
palette is *loud* — pink and gold clash cheerfully against forest, which is the point.

Use **2–3 accents per scene** (e.g. pink hero + gold highlight, or a forest banner + gold pill).
Text contrast is strict: **deep green text on cream / pink / cream-lt** for body and titles;
**cream text only on forest or deep fills** (reversed banners). Never put dark-on-gold body text
small — gold is a *display/button* fill, reserved for large CTA labels and graphic streaks.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
