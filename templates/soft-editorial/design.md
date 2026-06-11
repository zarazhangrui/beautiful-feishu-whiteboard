---
version: 1.0
name: Soft Editorial
renderer: feishu-svg-whiteboard
description: >
  A warm magazine-spread palette in the register of a small-press literary quarterly. A warm
  cream page hosts soft pastel cards in three interchangeable candy tones (dusty pink, chartreuse,
  peach blush), with warm near-black ink on every surface. Gentle and bookish, not technical. Depth
  comes from flat pastel color blocks on cream and generous space, never gradients or shadows. Built
  for calm explainers, overviews, and boards that should feel like a printed editorial page.

# ── COLOR ────────────────────────────────────────────────────
colors:
  paper: "#ECE9DC" # universal canvas: warm cream, never screen white
  ink: "#1C1A17" # ALL text on every surface: warm near-black, never pure #000
  pink: "#E2A8CE" # pastel card fill: dusty orchid pink
  lemon: "#C9DA4F" # pastel card fill: chartreuse yellow-green, the brightest — good for a hero card
  blush: "#E7C6AD" # pastel card fill: warm peach, the most neutral — good for a calm card
  # The three pastels are interchangeable PAINTS with NO fixed semantic role (pink is not "error",
  # lemon is not "warning"). Rotate through them for variety. Text never inverts: ink stays warm
  # near-black on cream and on every pastel.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "0 by default. Pastel cards are flat fills; add an optional 2px ink hairline only if a card needs to read as distinct."
  radius: "rounded (rx 16 to 28) for the soft card feel; sharp (rx 0) is allowed when a crisper block is wanted. Both are native."
---

# Soft Editorial — Feishu SVG Whiteboard Design System

A warm, paper-feeling palette: a single cream field with soft pastel cards floating on top and calm
warm-black ink. The mood is a literary quarterly or a design-research notebook, not a tech keynote.
Let the cream breathe, let the three pastels share a scene, and keep every label in ink.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
