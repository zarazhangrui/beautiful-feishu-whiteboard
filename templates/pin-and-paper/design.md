---
version: 1.0
name: Pin & Paper
renderer: feishu-svg-whiteboard
description: >
  A clean, graphic three-color palette: a white page with a royal cobalt blue and a canary yellow as
  the two accents. Blue leads as both the ink and the bold surface (text, borders, header bands, key
  fills); yellow is the punch, used for big numerals, a highlight swipe, thin rules, and small accent
  marks. Fresh and confident, like a modern brand one-pager. Flat color only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  white:  "#FFFFFF"   # universal canvas: clean white page
  blue:   "#2A3C99"   # royal cobalt: PRIMARY accent and the ink. Text, borders, header bands, key surface fills
  yellow: "#F1E84E"   # canary yellow: SECONDARY accent. Big numerals, highlight swipes, thin rules, small marks
  # White page + two accents. Blue leads (and carries text); yellow supports as the punch. Two
  # accents per scene; let the white breathe. Yellow is too light for text on white, never use it there.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "On the white page and on white cards, text is blue. On a blue fill, text is white (body) or yellow (a heading or numeral). Never use yellow for text on white."
  note: "Large bold white/yellow text on the cobalt fill reads well on the live board. The image export renders text color unreliably, so judge color via --output_as raw or the live board, not the exported PNG."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "2 to 3px solid blue for cards and panel outlines, so a white card reads on the white page; the blue header band is a borderless flat fill"
  rule:       "thin blue or yellow rules for row dividers"
  radius:     "low (rx 0 to 10); crisp and graphic"
---

# Pin & Paper — Feishu SVG Whiteboard Design System

A clean white page with a royal cobalt that is both the ink and a bold surface, and a canary yellow for
the punch. Lead with blue (title, body, header bands, card borders), let yellow snap in on the big
numerals, a highlight swipe under the title, and the thin row rules, and keep the white open so the two
accents pop.

## Color

- **White** (`#FFFFFF`): The universal canvas. Clean and bright. The default background.
- **Blue / Royal Cobalt** (`#2A3C99`): Does double duty. It is all text, borders, and dividers on the white page, and it is also a hero surface fill (the stage header bands, the outcome bar). The structural identity of the system.
- **Yellow / Canary** (`#F1E84E`): The punch. Big stage numerals, a highlight swipe under the title, thin row rules, small accent marks, and large headings on a blue fill. Too light for text on white, so keep it to fills and accents.

Two accents on a clean white page: blue leads and carries the text, yellow supports as the punch.
White cards are delineated on the white page by a 2px blue border.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
