---
version: 1.0
name: Violet Marker
renderer: feishu-svg-whiteboard
description: >
  A flat neobrutalist landing-page system — a bright lavender outer field framing a warm cream card with heavy black borders and hard squared corners. Panels abut flush like a web nav bar, a lime highlighter block sits behind one keyword, and a chunky purple button-tile carries the call to action. Type is heavy and mixed-case, ink-black on cream. NO shadows: depth is flat color blocks, thick black frames, panel role-swaps, and scale. Built for explainers, product/process walkthroughs, comparisons, and confident hero-and-steps system maps.

# ── COLOR ────────────────────────────────────────────────────
colors:
  field:   "#C5A1FF"   # bright lavender-purple — the outer field / top band / banners
  field-2: "#E9DFFE"   # pale lavender — recessed / quiet panels, secondary fills
  cream:   "#F9F5F2"   # warm off-white — the main card, all body panels, large text on purple
  ink:     "#000000"   # pure black — borders, headlines, ALL structural & label text
  slate:   "#666463"   # warm grey — body / paragraph text on cream
  lime:    "#CFEE30"   # acid-lime highlighter — the single punch: marker block behind a keyword, accents
  grape:   "#C29EFC"   # mid purple — the CTA button-tile and key fills
  # 2–3 accents per scene: cream + ink everywhere, then ONE of {lime, grape} as the punch. Dark text on light fills.

# ── TEXT COLOR (critical on a colored canvas) ────────────────
text-rules:
  on-cream:    "INK for headings/labels; SLATE for body. Always crisp."
  on-purple:   "INK for any size — always reliable. CREAM only for LARGE bold display (≥ ~28px). Never small cream text on purple."
  on-lime:     "INK text — always crisp (lime is the keyword highlight; keep the word black)."
  on-grape:    "INK text — always crisp."

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — NO shadows of any kind (not blurred, not the offset-duplicate trick).
# Depth = the heavy black frame, flat color blocks, panel role-swaps, and scale.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "3px solid ink"   # the main card frame, nav bar, cards, button-tiles
  rule:       "2px solid ink"   # internal dividers / nav underline
  radius: 0                     # hard squared corners throughout — no rounding
---

# Violet Marker — Feishu SVG Whiteboard Design System

A flat neobrutalist landing page you can read at a glance: a bright lavender field, a heavy
black-framed cream card sitting on it, a lime highlighter slashed behind one word, and a
purple button-tile to act on. Confident, mixed-case, ink-on-cream — never heavy with chrome,
never shadowed.

## Color

The **lavender field** (`#C5A1FF`) is the outer canvas and the top band — the thing the cream
card sits on. **Cream** (`#F9F5F2`) is the working surface: the main card, every body panel, and
the only color allowed for *large* display text on purple. **Ink** (`#000000`) is the structural
voice — every 3px border, every headline, every label. **Slate** (`#666463`) carries paragraph
body on cream. The punch is a single accent per scene: **lime** (`#CFEE30`) as a highlighter block
behind one keyword (the signature move), or **grape** (`#C29EFC`) as the CTA button-tile and key
fills. Pale **field-2** (`#E9DFFE`) only recesses a quiet panel. Keep it to cream + ink plus ONE
loud accent — don't run lime and grape loud in the same scene.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
