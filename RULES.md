# Feishu SVG Whiteboard — Medium Rules

These apply to **every** board, regardless of template. A template gives you a **color palette
and a mood**; this file is the **hard limits of the medium**. All of it is verified empirically on
the real board (the image export and the GUI behave differently — see notes below).

## Hard rules

- **One font.** The board hardcodes a single font (Noto Sans SC). Never set `font-family`. Type is
  size / weight / casing / letter-spacing only — there is no typeface choice.
- **Text lives in `<text>` / `<tspan>`** — never outline glyphs as `<path>`.
- **Shape vocabulary is native-only — a rectangles-and-circles tool.** Build everything from
  `<rect>` (sharp or rounded `rx`), `<circle>`, `<ellipse>`, straight `<line>` / `<polyline>`
  connectors, and `<text>` — these become real editable shapes. `<polygon>` and any curved/bezier
  `<path>` embed as flat **images** (not shapes, render lumpy) — at most one simple triangle/diamond
  as a minor accent, never structural. **No freeform / organic / illustrative shapes** (blobs,
  leaves, petals, waves, coral, fans, flowers, stars, confetti, doodles, mascots, "hand-cut"
  silhouettes). If a reference is organic, keep only its **palette** and rebuild with rects + circles.
- **Arrows = native connectors, never hand-drawn heads.** To put an arrowhead on a line, give the
  `<line>` or `<polyline>` a **`marker-end`** (and `marker-start` for a double-headed arrow)
  pointing at a `<marker>` in `<defs>`. The board converts these into **native connectors with a
  clean built-in arrowhead**, and the arrow takes the line's `stroke` colour. **Never draw an
  arrowhead as a separate `<polygon>` / triangle** — a polygon embeds as a flat image and renders
  rough, squiggly, and hand-drawn (unprofessional). One marker definition serves the whole board:
  ```svg
  <defs>
    <marker id="arrow" markerWidth="12" markerHeight="12" refX="9" refY="4"
            orient="auto" markerUnits="strokeWidth"><path d="M0 0 L10 4 L0 8 z"/></marker>
  </defs>
  <line x1="100" y1="80" x2="360" y2="80" stroke="#0D4FA8" stroke-width="3" marker-end="url(#arrow)"/>
  <!-- right-angled connector: polyline (H/V points) + marker-end -->
  <polyline points="100,140 240,140 240,220" fill="none" stroke="#0D4FA8" stroke-width="3" marker-end="url(#arrow)"/>
  <!-- double-headed (e.g. read/write): add marker-start too -->
  <line x1="100" y1="280" x2="360" y2="280" stroke="#0D4FA8" stroke-width="3" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
  ```
  (The marker's own shape/colour is ignored on the board; it just signals "put a native arrowhead
  here." Keep the line straight or right-angled — those map to clean `straight` / `right_angled` connectors.)
  **The classic defect** is a `<line>` plus a separate little `<polyline>` / `<polygon>` chevron drawn
  at its tip — that chevron IS a hand-drawn arrowhead. Delete it and put `marker-end` on the line.
  **Mandatory self-check before you write the board:** run
  `grep -nE '<polygon|<polyline' <dir>/diagram.svg` — every `<polygon>`, and every short `<polyline>`
  shaped like a triangle/chevron at a line's endpoint, is a defect to convert. (A `<polyline>` is fine
  ONLY as a right-angled connector path that itself carries `marker-end` and has no separate chevron.)
  **This matters most when you START FROM or EDIT an existing SVG** (a gallery template, a previous
  board, a translation): its arrows may predate this rule and still be hand-drawn — re-check and
  convert them, don't just edit the text around them.
- **Forbidden** (break or flatten to a static image): any gradient, `<filter>`, `<pattern>`,
  `<clipPath>`, `<mask>`, blur.
- **Opacity is ignored.** `opacity` / `fill-opacity` / `stroke-opacity` all render fully opaque.
  To get a paler tint, use a **solid lighter hex** — never alpha. (To fake a translucent overlap,
  paint the overlap region as its own solid darker shape.)
- **Text color is unrestricted on the live board** (any hex; the GUI's ~9 presets are not a limit) —
  **but the image export renders text color unreliably (often black).** Judge text color via
  `+query --output_as raw` (stored hex) or the live board, **never** the exported PNG. Light/cream
  text works on saturated-dark fills when it's large and bold; small light text on near-black is unreliable.
- **Shadows.** No blur/filter shadows (unsupported). Hard **offset shadows are allowed and fine** —
  draw one as a **solid duplicate of the SAME shape** offset behind the real one (never a blur). It must
  match the element's shape exactly: same `rx` (a pill's shadow is a pill, not a rect), same `width`/`height`,
  and inside the same `rotate()` group so it tilts with the element. Default can still be flat — depth also
  comes from flat color blocks, role-swaps, and scale.
- **No decorative micro-chrome.** No ornamental kicker/footer/slug/metadata labels. Every text
  element must be load-bearing and legible (≥ ~16px, strong contrast); keep small text inside
  high-contrast panels, never small on a colored canvas.
- **Never echo the user's instructions or your own process onto the board.** The board shows the
  **content** — never the request that produced it, the inputs you read, or how you built it. A
  whiteboard is a finished artifact, not a homework submission, so it carries no "here's what you
  asked for" framing. Cut every meta / process line, for example:
  - scope or task notes — _"整理范围：仅总结张睿发言；问答部分按她的回答归纳"_, _"本图涵盖第 3-5 章"_
  - source citations — _"来源：会议逐字稿 00:06:28–00:52:58 的张睿发言"_, _"based on the attached doc"_
  - the chosen style / template name — _"风格：Specimen Bold"_, _"Riso Brut template"_
  - audience / format directions, restatements of the prompt, and _"summary of… / 总结自…"_ framing
  - dates, tokens, file paths, or tooling you were not explicitly asked to display

  A **title may name the subject** (e.g. _"张睿 · 发言总结"_ is fine — that is the topic), but nothing
  on the board may describe the task, the source material, or the tool. **Litmus test:** if a line is
  addressed to the person who asked (or to a grader) rather than being a real part of the artifact,
  delete it. Put that kind of context in your chat reply to the user, never on the canvas.

- **Transforms:** `translate` / `rotate` / `scale` are safe; avoid `skewX` / `skewY` / `matrix(...)`.
- **No fixed canvas.** No 16:9, no scaler. Work in a logical coordinate space (≈1600–1700 wide) and
  let content define the bounds.
- **Text reflows by character** (CJK ≈ 1em, Latin ≈ 0.6em). Pad boxes generously; never fit text to
  the pixel; wrap long lines across `<tspan>`s rather than shrinking.

## Workflow

1. Pick a **template** (`templates/<slug>/design.md`) for the palette + mood, and read it.
2. Pick the narrative shape (pipeline / stages / comparison / system map / timeline) and write the
   SVG in a logical coord space (≈1600–1700 wide); **native shapes only**; every label a `<text>`.
3. **Render and LOOK at it — then fix what you see.** This is the most important step:
   - `npx -y @larksuite/whiteboard-cli@^0.2.11 -i <dir>/diagram.svg -o <dir>/diagram.png -f svg`
   - `npx -y @larksuite/whiteboard-cli@^0.2.11 -i <dir>/diagram.svg -f svg --check`
   - **Open `diagram.png` and actually view it.** Correct the common problems before moving on, and
     iterate render → look → fix until it's clean:
     - **text overflow** — text spilling out of its box or past the canvas edge,
     - **margins / padding** — content flush to the canvas edge, or a numeral/title touching a box's
       top/side with no breathing room,
     - **overlaps** — shapes or labels colliding unintentionally (a duplicate-offset shadow or an
       intentional overlap is fine; an accidental one is not),
     - **clipping** — anything cut off on the right/bottom.
     - **hand-drawn arrowheads** — run `grep -nE '<polygon|<polyline' <dir>/diagram.svg` and convert any
       chevron/triangle arrowhead to a `marker-end` (see the Arrows rule above). Do this every time,
       and especially when you started from an existing SVG whose arrows may predate the rule.
   - (`--check` flags `text-overflow`/`node-overlap`; intentional overlaps, off-canvas bleed, or a
     centered long Latin headline may report as warnings — judge with your eyes, not just the linter.)
   - **Fix by editing the `.svg` in place with small targeted edits** (nudge a box, widen a panel,
     rewrap a label) — never regenerate the whole SVG to fix a local issue, and apply every fix you
     spotted in one view in a single edit pass before re-rendering. This keeps the iterate loop cheap
     without losing any pass.
4. **Write it into Feishu as an editable whiteboard**, then **look at the real board too:**
   `npx -y @larksuite/whiteboard-cli@^0.2.11 -i <dir>/diagram.svg --to openapi --format json | lark-cli whiteboard +update --whiteboard-token <tok> --source - --input_format raw --idempotent-token <unique> --overwrite --as user`
   then `lark-cli whiteboard +query --whiteboard-token <tok> --output_as image --output <dir> --as user`,
   view it, and fix any remaining layout issues. The export is faithful for **layout, shapes, fills,
   opacity** — but **not text color** (verify color via `--output_as raw` or the live doc, not the PNG).

### Creating the doc + whiteboard block to write into

If the user didn't give a target whiteboard, create one:

```bash
# new doc with an empty whiteboard block; grab the block_token from the response
lark-cli docs +create --api-version v2 \
  --content '<title>My board</title><whiteboard type="blank"></whiteboard>' --as user
```

Then write the SVG to that `block_token` with the `whiteboard +update` command in step 4. To add a
board to an existing doc the user gave, fetch it (`lark-cli docs +fetch`) or append a
`<whiteboard type="blank"></whiteboard>` block, and use that block's token.
