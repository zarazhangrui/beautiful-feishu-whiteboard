---
version: 1.0
name: Pin & Paper
renderer: feishu-svg-whiteboard
description: >
  A bulletin-board palette anchored to a yellow-and-blue complementary pair. A saturated cadmium
  yellow page hosts calm ivory cream cards, with deep cobalt ink carrying every text run, border,
  and divider. One cinnabar red is reserved for a rubber-stamp accent and a negative-state pill,
  never used anywhere else. Loud, warm, and handmade, like a pinned-up paper noticeboard. Flat color
  only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  paper:       "#EFE56A"   # dominant surface: saturated cadmium yellow, the loud page
  paper-2:     "#F5ECA0"   # lighter yellow: alternate card fill to break adjacent same-tone cards
  paper-3:     "#E8D85A"   # deeper yellow: higher-contrast moments
  paper-extra: "#FBE6A4"   # warm yellow with a cream hint: the most differentiated card variant
  cream:       "#F8F1D6"   # card background: soft ivory that lets cards recede from the loud page
  kraft:       "#C9A66B"   # warm tan, reserved (available, not a default)
  ink:         "#1F3A8A"   # deep cobalt: ALL text, borders, dividers, structural lines
  ink-soft:    "#2D4FB8"   # slightly lighter cobalt, rarely used
  ink-line:    "#3457C4"   # brighter cobalt for line decoration, rarely used
  ink-deep:    "#0E1430"   # near-black with a blue cast: an optional dark surface variant
  red:         "#C2342B"   # cinnabar: ONLY the stamp accent and the negative pill, never general use
  olive:       "#6B7A2E"   # reserved (available, not a default)
  orange:      "#D8702A"   # reserved (available, not a default)
  # Two-color logic: yellow surface + cobalt ink. Cream is the card. Red is reserved to two roles.

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "2 to 3px solid cobalt ink for cards and panels"
  rule:       "2px solid cobalt ink for dividers"
  radius:     "low (rx 0 to 10); slight card rotation reads as pinned paper but is optional"
---

# Pin & Paper — Feishu SVG Whiteboard Design System

A loud yellow noticeboard with cobalt ink and calm ivory cards. The yellow-and-blue complementary
pair is the whole identity: keep the page yellow, keep every mark cobalt, and let cream cards recede
so the text stays readable against the bright field.

## Color

- **Paper Yellow** (`#EFE56A`): The dominant surface. Saturated cadmium yellow. This is what makes the board read as a bright paper field.
- **Paper Light** (`#F5ECA0`): A lighter, less saturated yellow. An alternate card fill to break two same-tone cards sitting together.
- **Paper Deep** (`#E8D85A`): A deeper, more saturated yellow for higher-contrast moments.
- **Paper Extra** (`#FBE6A4`): A warm yellow with a hint of cream, the most differentiated card variant.
- **Cream** (`#F8F1D6`): The card background. A soft off-white ivory that lets cards recede from the loud page. The standard card surface.
- **Kraft** (`#C9A66B`): A warm tan. Available in the set but reserved, not a default.
- **Ink Blue** (`#1F3A8A`): Deep cobalt. The universal text, border, and divider color. The structural identity of the system.
- **Ink Soft** (`#2D4FB8`) and **Ink Line** (`#3457C4`): lighter and brighter cobalt variants, available but rarely needed.
- **Ink Deep** (`#0E1430`): A near-black with a blue cast, for an optional dark surface variant.
- **Cinnabar Red** (`#C2342B`): Reserved for exactly two roles, a rotated rubber-stamp accent and a negative-state pill. Never use it as general text, fill, or border.
- **Olive** (`#6B7A2E`) and **Orange** (`#D8702A`): in the set but reserved, not active defaults.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
