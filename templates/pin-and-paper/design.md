---
version: 1.0
name: Pin & Paper
renderer: feishu-svg-whiteboard
description: >
  A bold three-color poster palette anchored to a yellow-and-blue complementary pair. A canary-yellow
  page, a royal cobalt blue that works as both ink and a full surface, and a calm buttery cream for
  panels. On the yellow page or a cream panel, text is cobalt; on a cobalt panel, the heading goes
  yellow and the body goes cream. Confident, graphic, and high-contrast. Flat color only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  paper:  "#F1E84E"   # canary-yellow page: the dominant surface, AND the heading text color on a cobalt fill
  ink:    "#2A3C99"   # royal cobalt: ALL text/borders on light surfaces, AND a hero surface fill (a solid blue panel)
  cream:  "#F4EEC9"   # pale buttery panel/card: the calm surface that holds body content, and the body text color on a cobalt fill
  # Three colors only. Yellow page + cobalt + cream. Cobalt is both the ink and a big surface;
  # on that cobalt surface, headings are yellow and body text is cream.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "On the yellow page or a cream panel, text is cobalt (ink). On a cobalt panel, the heading is yellow (paper) and the body text is cream."
  note: "Large bold yellow/cream text on the cobalt fill reads well on the live board. The image export renders text color unreliably, so judge color via --output_as raw or the live board, not the exported PNG."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "2 to 3px solid cobalt for cards and panel outlines; the cobalt surface panel is a borderless flat fill"
  rule:       "2px solid cobalt for dividers"
  radius:     "low (rx 0 to 10); crisp and graphic"
---

# Pin & Paper — Feishu SVG Whiteboard Design System

A graphic three-color poster: a canary-yellow page, a royal cobalt that is both the ink and a bold
surface, and a calm cream for panels. Pair a solid cobalt block (yellow heading, cream body) against a
cream panel (cobalt text) on the yellow ground, and let the yellow-and-blue contrast carry the whole
identity.

## Color

- **Paper / Canary Yellow** (`#F1E84E`): The dominant page surface, and the heading text color on a cobalt fill. Saturated and bright.
- **Ink / Royal Cobalt** (`#2A3C99`): Does double duty. It is all text, borders, and dividers on the light surfaces, and it is also a hero surface fill (a solid blue panel). The structural identity of the system.
- **Cream** (`#F4EEC9`): A pale buttery panel and card surface that calms the loud page, and the body text color on a cobalt fill.

Three colors only. On the yellow page or a cream panel, text is cobalt. On a cobalt panel, the heading
goes yellow and the body goes cream.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
