---
version: 1.0
name: Grove
renderer: feishu-svg-whiteboard
description: >
  A grounded, editorial palette on a warm parchment page with deep forest green as the accent. The
  light parchment is the dominant background; forest green carries the headers, the accent fills, and
  the body text, and cream sits as the light text on any green fill. A single terracotta coral is the
  one warm spark, used sparingly for emphasis, a short rule, a stat figure, or an ordinal. Editorial
  and refined. Flat color only, no gradients.

# ── COLOR ────────────────────────────────────────────────────
colors:
  parchment: "#e8e4d6" # DEFAULT canvas: warm parchment, reads as good paper stock, never white
  parchment-2: "#dedad0" # a slightly cooler parchment for a secondary light surface
  green: "#192b1b" # the ACCENT: header bands, accent fills, key blocks, AND the body text on parchment
  green-2: "#1e3221" # a slightly lighter forest green for a second green fill
  cream: "#d4cfbf" # warm cream: the text color ON a green fill (light-on-dark), never pure white — the off-white temperature is essential to the printed-ink feel
  accent: "#c8524a" # terracotta coral: the single warm spark, used sparingly for an italic emphasis, a short rule under a kicker, a stat figure, or an ordinal — never a surface fill, never body paragraphs
  # Parchment is the page; deep forest green is the accent and the ink on parchment; cream is the
  # text on green; coral is the one spark.

# ── TEXT COLOR ───────────────────────────────────────────────
text-rules:
  rule: "On the parchment page, text is forest green. On a green accent fill, text is cream. Coral is for small emphasis accents only, never body text."
  note: "Large bold cream text on a green fill reads well on the live board. The image export renders text color unreliably, so judge color via --output_as raw or the live board, not the exported PNG."

# ── STROKE & CORNERS ─────────────────────────────────────────
stroke:
  structural: "mostly borderless flat fills; a green header band or panel on the parchment page is the signature. A short coral rule under a kicker is the spark mark."
  radius: "low to none (rx 0 to 8); editorial and squared"
---

# Grove — Feishu SVG Whiteboard Design System

A warm parchment page with deep forest green as the accent. The parchment is the dominant ground; the
forest green does the loud work as header bands, accent panels, and the body ink on parchment, with
cream as the text on any green fill. The single terracotta coral is precious: spend it on an italic
emphasis, a short rule, a stat, or an ordinal, and never as a big fill. The discipline is the elegance.

## Rules

This template is the **palette + mood** only. Every medium constraint (native shapes, opacity ignored, the text-color export caveat, no gradients/filters/shadows, reflow) and the build/verify workflow live in **[`../../RULES.md`](../../RULES.md)** — read it before building.
