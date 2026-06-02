---
version: 1.0
name: Editorial Forest
renderer: feishu-svg-whiteboard
description: >
  A serif-led editorial palette in the register of a literary quarterly or art-book monograph. A
  tight five-color set pairs a deep forest green with a dusty rose pink over an oat-cream paper
  ground. Confident, paper-feeling, and committed to a small vocabulary, closer to a Penguin classic
  or a quiet annual report than a tech keynote. Flat color only, no gradients or shadows. The three
  primary surfaces (green, pink, cream) carry surface-dependent text inversion.

# ── COLOR ────────────────────────────────────────────────────
colors:
  green:      "#2e4a2a"   # primary surface AND primary text-on-cream: deep forest green
  green-deep: "#243a21"   # text color on pink surfaces (pure green lacks contrast there)
  green-lite: "#3a5a36"   # second green fill when two greens sit side by side; carries pink text
  pink:       "#e89cb1"   # surface, tile fill, and the on-green text color: dusty rose, the accent
  pink-deep:  "#d27e96"   # border on pink-filled tiles where same-color border must differentiate
  cream:      "#efe7d4"   # oat paper: default non-cover background AND on-green body text color
  cream-2:    "#e6dcc4"   # subtly darker cream tile on the cream ground (pair with a 2px green border)
  ink:        "#1a1a17"   # body text on cream surfaces: warm near-black, never pure #000
  # Use a small vocabulary per scene. Body is ink on cream; on a green surface text becomes cream
  # or pink; on a pink surface text becomes green-deep or cream.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "Text color follows the surface. On cream: ink (warm near-black), green for headings. On a green fill: cream (body) or pink. On a pink fill: green-deep or cream."
  note: "Large bold light text on the green fill reads well on the live board. The image export renders text color unreliably, so judge color via --output_as raw or the live board, never the exported PNG."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "2px solid green for cream-2 tiles; pink-deep for borders on pink tiles. Many surfaces are borderless flat fills."
  rule:   "2px solid green for dividers and meta rules"
  radius: "low to none (rx 0 to 8); the look is squared editorial, not soft"
---

# Editorial Forest — Feishu SVG Whiteboard Design System

A deep forest green, a dusty rose, and an oat-cream page: three surfaces and a couple of near-duplicate
shades, used with editorial discipline. Pick one surface to anchor a scene, keep the color count low,
and let the green-and-pink pairing carry the identity.

## Color

- **Green** (`#2e4a2a`): The deep forest primary. A slide surface, a tile fill, a card border, a divider color, and the primary heading color on cream. The most distinctive surface in the system.
- **Green Deep** (`#243a21`): A darker green used mainly as text color on pink surfaces, where pure green would lack contrast.
- **Green Lite** (`#3a5a36`): A lighter green used as a fill when two greens need to sit beside each other. Carries pink text.
- **Pink** (`#e89cb1`): A dusty rose. A surface, a tile fill, and the on-green text color. The system's primary accent.
- **Pink Deep** (`#d27e96`): A slightly darker rose used only as a border on pink-filled tiles.
- **Cream** (`#efe7d4`): The oat paper surface. The default background on non-cover scenes, and the on-green body text color.
- **Cream 2** (`#e6dcc4`): A subtly darker cream tile on the cream ground. Pair with a 2px green border so it reads as distinct.
- **Ink** (`#1a1a17`): Body text on cream surfaces. A warm near-black, never pure black.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
