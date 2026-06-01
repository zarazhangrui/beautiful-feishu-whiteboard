---
version: 1.0
name: Confetti Wedge
renderer: feishu-svg-whiteboard
description: >
  A bright, playful brand-deck system — a cool near-white page punctuated with big flat pastel color blocks (candy pink, mint green, aqua teal) that bleed off the edges as rectangles and circles, framing a heavy black rounded-sans headline. No borders, no shadows: depth and energy come purely from oversized flat color blocks, generous air, and a huge weight jump between the black display word and the soft charcoal body. Best for upbeat brand explainers, value/personality showcases, kickoff title scenes, and light playful concept maps.

# ── COLOR ────────────────────────────────────────────────────
colors:
  page:    "#F4F8FB"   # canvas — cool airy near-white with a faint blue cast
  ink:     "#000000"   # ink / structure — pure black, used for the heavy display word
  charcoal: "#3A3C3E"   # secondary ink — soft charcoal for body copy
  pink:    "#F8BED4"   # accent-1 — candy/blossom pink block
  mint:    "#62C0A5"   # accent-2 — fresh mint-green block & big numerals
  aqua:    "#65C8CD"   # accent-3 — aqua-teal block
  # Rule: 2–3 pastel accents per scene (each its own block/circle); they may all appear loudly since
  # the palette is deliberately festive — but keep them as separate flat shapes, never overlapping.
  # Dark text on the page or on light cards; on a pastel block use only LARGE black display words.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = big flat color blocks bleeding off-canvas,
# generous negative space, panel role-swaps, and a large display-vs-body scale jump.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "0 (no outlines — blocks & cards are flat color silhouettes)"
  rule:       "3px solid #3A3C3E"   # only when an explicit divider is truly needed
  radius: 24   # cards are softly rounded; color blocks may be sharp rects or full circles
---

# Confetti Wedge — Feishu SVG Whiteboard Design System

A festive title-deck look: a cool near-white page punctuated with big flat pastel rectangles and
circles that slip off the edges, with one heavy black rounded headline doing the talking — no
outlines, no shadows, pure color-block joy.

## Color
Three pastel accents on one cool canvas. **Page `#F4F8FB`** is an airy near-white with a faint
blue cast — the breathing room the whole system depends on. The three accents —
**pink `#F8BED4`**, **mint `#62C0A5`**, **aqua `#65C8CD`** — are the personality: flat rectangles
and circles that bleed off the corners and edges. They read as cheerful, saturated-but-soft
pastels; deploy 2–3 per scene (festive is the point), but keep each as its own clean flat shape —
never overlap two pastels or mix them muddy. **Ink `#000000`** carries the heavy display word;
**charcoal `#3A3C3E`** carries body copy (a touch softer than pure black so the headline still wins).
Dark text on the page or on light cards. On a pastel block place ONLY a large black display word —
never small dark labels, since dark-on-pastel low-contrast text reads as noise. To make a block
"lighter," pick a lighter solid hex — never opacity.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
