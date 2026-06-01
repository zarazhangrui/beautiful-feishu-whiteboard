---
version: 1.0
name: Mint Brut
renderer: feishu-svg-whiteboard
description: >
  A candy-bright neo-brutalist design system for Feishu SVG whiteboards, drawn from playful mobile-UI mockups. A mint-green canvas carries flat cream cards capped by hot-pink header bands, all bound by heavy 3–4px black borders with softly rounded corners. Type is a clean bold register — no display typeface survives, so weight and scale do the work — and bright pink / green / gold accents pop as solid color-blocks with bold accent chips breaking the grid. FLAT throughout: no shadows, no gradients. Built for friendly explainers, onboarding flows, step sequences, and comparison or system maps that should feel approachable rather than corporate.

# ── COLOR ────────────────────────────────────────────────────
colors:
  mint:     "#D0FDE4"   # universal canvas background — bright minty green
  cream:    "#FFFBF3"   # card / panel body fill — warm near-white
  ink:      "#000000"   # all borders, body text, rules — pure black
  pink:     "#F888C8"   # dominant accent: header bands, big numerals
  green:    "#70F0A8"   # secondary accent: money-bill stamps, highlights
  gold:     "#F0DE4E"   # punctuation accent: coin stamps, badges, dots
  pale-pink: "#F8E0F0"   # soft note / aside panel fill (solid light, not opacity)
  # Use 2–3 accents per scene, never all at once. Colors pop flat against mint — never blend.

# ── DEPTH ────────────────────────────────────────────────────
# FLAT system — no shadows of any kind. Depth = flat color blocks (pink band on cream card),
# heavy ink borders, panel role-swaps, and scale. Never offset-duplicate or blur for depth.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "4px solid ink"   # cards, panels, badges, stamps
  rule:       "3px solid ink"   # dividers, input fields, connectors
  radius: 12                    # softly rounded corners on cards/inputs; 0 acceptable on small stamps
---

# Mint Brut — Feishu SVG Whiteboard Design System

A design system for building **friendly explanatory diagrams** as editable Feishu
whiteboards written in SVG. The aesthetic is candy neo-brutalism: flat cream cards with
hot-pink header bands on a bright mint canvas, bound by heavy black borders with gently
rounded corners, punctuated by bold accent chips. It looks playful and
hand-built, not corporate-templated.

## Color

- **Mint** (`#D0FDE4`) is the universal background — bright and friendly, never white.
- **Cream** (`#FFFBF3`) fills every card and panel body, giving the warm surface that ink text sits on.
- **Ink** (`#000000`) carries every border, rule, and body text — pure, chunky black.
- Three accents pop flat against the mint: **pink** (`#F888C8`, dominant — header bands and big numerals), **green** (`#70F0A8`, money-bill stamps and highlights), **gold** (`#F0DE4E`, coin stamps and badges). **Pale-pink** (`#F8E0F0`) is a soft solid for aside/note panels.
- Use **two or three accents per scene**, never all at once. Keep dark (ink) text on the light cream/pale-pink fills; reserve pink/green/gold for large fills and graphic stamps, never as a field under small text.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
