---
version: 1.0
name: Cut Bloom
renderer: feishu-svg-whiteboard
description: >
  A calm two-color color-block system — flat periwinkle blue and marigold yellow blocks on a clean white page, built entirely from rectangles, rounded-rects, circles, and ellipses with no borders. Depth comes purely from solid color blocks and figure-ground contrast, plus a darker solid periwinkle where blocks overlap, never from outlines or shadows. Type is quiet and lowercase-leaning so the color blocks carry the show. Best for warm, editorial explainers, concept maps, value/principle showcases, and gentle process flows where the structure should feel soft and unhurried.

# ── COLOR ────────────────────────────────────────────────────
colors:
  paper:    "#FFFFFF"   # canvas — clean print white, generous margins
  periwinkle: "#535D9E" # accent-1 / primary motif — the dominant block & node fill
  periwinkle-deep: "#4D5794" # accent-1 shade — solid darker periwinkle for overlap (NOT opacity)
  marigold: "#F0CB65"   # accent-2 — warm counterpoint blocks; used in pairs/spots
  ink:      "#2E3566"   # ink / structure — deep blue-navy for body text & rare rules; harmonizes with periwinkle
  # Rule: 2 accents per scene (periwinkle + marigold) on white. Dark text on light fills;
  # on the periwinkle fill use white or marigold for any large display word, never small dark labels.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = flat color blocks, figure-ground white gaps,
# panel role-swaps, and scale. Overlap is shown by stacking solid rect/ellipse shapes, not transparency.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "0 (no outlines — shapes are flat color blocks distinguished by fill)"
  rule:       "3px solid #2E3566"   # only when an explicit divider is needed
  radius: 28   # cards & blocks are softly rounded (rx); sharp rects are fine too
---

# Cut Bloom — Feishu SVG Whiteboard Design System

A two-color color-block layout: flat periwinkle and marigold rectangles, rounded-rects, and
circles laid on white, no outlines, no shadows — pure solid color doing all the work.

## Color
Two accents, one canvas. **Periwinkle `#535D9E`** is the dominant structural color — node fills,
big numerals, section bands, the larger color blocks. **Marigold `#F0CB65`** is the warm
counter-accent — highlight blocks, the "this one" callout; use it in twos or threes, never
wall-to-wall. **Paper `#FFFFFF`** is the canvas and the breathing room *between* blocks (the
white gaps are part of the design — let shapes carry negative space). **Ink `#2E3566`** is for
body text and the rare 3px divider rule. To layer one periwinkle shape over another and still read
the overlap, drop the overlapping region to solid **`#4D5794`** — a darker *solid* color, never
opacity, and only with rect/ellipse overlaps. Temperature: cool blue lifted by warm yellow —
calm, harmonious, not loud. Dark text (ink) on white or on marigold cards. On a periwinkle fill,
only large white or marigold display words — never small dark labels on it.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
