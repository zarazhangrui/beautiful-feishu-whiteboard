---
version: 1.0
name: Confetti Wedge
renderer: feishu-svg-whiteboard
description: >
  A bright, playful brand-deck system: a cool near-white page, content-first, with a few small flat
  pastel confetti accents (candy pink, mint green, aqua teal) tucked into the margins, and a heavy
  black rounded-sans headline doing the talking. No borders, no shadows: energy comes from a big
  display-vs-body weight jump, generous air, and small cheerful colour accents — never huge blocks
  that crowd the content. Best for upbeat brand explainers, kickoff title scenes, and light concept maps.

# ── COLOR ────────────────────────────────────────────────────
colors:
  page:    "#F4F8FB"   # canvas — cool airy near-white with a faint blue cast
  ink:     "#000000"   # ink / structure — pure black, used for the heavy display word
  charcoal: "#3A3C3E"   # secondary ink — soft charcoal for body copy
  pink:    "#F8BED4"   # accent-1 — candy/blossom pink
  mint:    "#62C0A5"   # accent-2 — fresh mint-green, also big numerals / header bands
  aqua:    "#65C8CD"   # accent-3 — aqua-teal
  # Rule: 2–3 pastel accents per scene. Keep decorative confetti SMALL and SPARSE (a few ~16–40px
  # dots/wedges in the OUTER MARGINS only) — never large blocks or circles that bleed across or
  # overlap the content. The accents can also be the stage header bands. Content first, decoration last.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = the big display-vs-body scale jump, generous
# negative space, panel role-swaps, and a few small flat colour accents. Not oversized blocks.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "0 (no outlines — cards & accents are flat color silhouettes)"
  rule:       "3px solid #3A3C3E"   # only when an explicit divider is truly needed
  radius: 24   # cards are softly rounded; small accents may be sharp wedges or dots
---

# Confetti Wedge — Feishu SVG Whiteboard Design System

A festive but tidy title-deck look: a cool near-white page with one heavy black rounded headline
doing the talking, the content (cards, rows) front and centre, and just a few small pastel confetti
accents sprinkled in the margins for cheer. No outlines, no shadows. The joy comes from colour and a
big weight jump, not from oversized blocks.

## Color
Three pastel accents on one cool canvas. **Page `#F4F8FB`** is an airy near-white with a faint blue
cast: the breathing room the whole system depends on. The three accents, **pink `#F8BED4`**,
**mint `#62C0A5`**, **aqua `#65C8CD`**, are the personality. Use them for the stage header bands and
for a few SMALL confetti accents (little dots or wedges, roughly 16 to 40px) tucked into the outer
margins. Keep decoration small and sparse: never let a big block or circle bleed across the canvas or
overlap the content, which reads as busy and distracting. Deploy 2 to 3 accents per scene, each its
own clean flat shape, never overlapping or muddy. **Ink `#000000`** carries the heavy display word;
**charcoal `#3A3C3E`** carries body copy. Dark text on the page or on light cards. On a pastel block
place ONLY a large black display word, never small dark labels. To make a colour lighter, pick a
lighter solid hex, never opacity.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
