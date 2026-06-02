---
version: 1.0
name: Grove
renderer: feishu-svg-whiteboard
description: >
  A grounded, two-surface editorial palette with one warm accent. Dark scenes use a deep forest green
  with warm-cream text; light scenes flip to a warm parchment with the same forest green now used as
  text. A single terracotta coral is the only accent, used sparingly for emphasis, a short rule, a
  stat figure, or an ordinal, never as a surface fill or for body paragraphs. Editorial and refined.
  Flat color only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  bg:           "#192b1b"   # dominant dark canvas: deep forest green
  bg-alt:       "#1e3221"   # a slightly lighter forest green for secondary dark fills/placeholders
  bg-light:     "#e8e4d6"   # warm parchment: the light-scene canvas, reads as good paper stock
  bg-light-alt: "#dedad0"   # a slightly cooler parchment for secondary light regions
  fg:           "#d4cfbf"   # warm cream: primary text on dark surfaces, never pure white
  fg-light:     "#192b1b"   # primary text on light surfaces: the SAME forest green as bg
  accent:       "#c8524a"   # terracotta coral: the single accent, used sparingly, never a fill
  # The surface-text inversion is the device: forest green is both the dark canvas and the
  # dark-on-light text. Cream is the light-on-dark text. Coral is the one warm note.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "On the dark forest-green canvas, text is warm cream (fg). On the parchment canvas, text is forest green (fg-light, same hex as bg). Coral is for emphasis accents only."
  note: "Large bold cream text on the green canvas reads well on the live board. The image export renders text color unreliably, so judge color via --output_as raw or the live board, not the exported PNG."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "mostly borderless; surfaces are flat fills. A short coral rule under a kicker is the signature mark."
  radius:     "low to none (rx 0 to 8); editorial and squared"
---

# Grove — Feishu SVG Whiteboard Design System

Two surfaces and one warm note. Dark scenes are deep forest green with warm-cream text; light scenes
are warm parchment with forest-green text, the green doing double duty as both a surface and a text
color. The single terracotta coral is precious: spend it on an italic emphasis, a short rule, a stat,
or an ordinal, and never as a fill. The discipline is the elegance.

## Color

- **BG / Deep Forest** (`#192b1b`): The dominant dark canvas. A deep, considered forest green. The default dark background.
- **BG Alt** (`#1e3221`): A slightly lighter forest green for a secondary dark fill or placeholder, a tonal step up that stays in the green family.
- **BG Light / Parchment** (`#e8e4d6`): The warm parchment surface for light scenes. Reads as good paper stock, not digital white.
- **BG Light Alt** (`#dedad0`): A slightly cooler parchment for a secondary light region.
- **FG / Warm Cream** (`#d4cfbf`): Primary text on dark surfaces. Warm cream, never pure white. The off-white temperature is essential to the printed-ink feel.
- **FG Light** (`#192b1b`): Primary text on light surfaces. Shares its hex with BG: the deep forest green is both the dark canvas and the dark-on-light text. This inversion is the system's core device.
- **Accent / Terracotta Coral** (`#c8524a`): The single warm note. Use it sparingly for an italic emphasis, a short rule under a kicker, an em-dash style bullet, a stat figure, or a chapter ordinal. Never as a surface fill, never for body paragraphs.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
