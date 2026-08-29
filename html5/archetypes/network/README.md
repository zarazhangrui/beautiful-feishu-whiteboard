# Network / Architecture Graph Archetype

Use for relationship networks, architecture diagrams, dependency graphs, org charts, and
node-edge views that benefit from selection, filtering, pan, and zoom.

## Required structure

- Title and one-line summary at the top.
- A toolbar containing stable test hooks:
  - `[data-viz-filter]` or `[data-viz-action="filter"]` for category filters.
  - `[data-viz-action="pan"]` for panning (or `pan-left`/`pan-right` variants).
  - `[data-viz-action="zoom-in"]`, `[data-viz-action="zoom-out"]`, and a reset control.
- An interactive SVG graph under `[data-viz-canvas]`. Use native shapes only
  (`rect`, `circle`, `ellipse`, `line`, `polyline`, `path` inside `marker`, `text`).
  Every node carries `data-node-id`; edges carry `data-edge-id` plus source/target ids.
- Every node and every edge is clickable: clicking a node or an edge updates `[data-viz-state]`
  with the selected label (edges show `source → target`), so both shapes participate in the
  `select` interaction.
- A detail panel `[data-viz-state]` that the page updates on every interaction so the
  renderer can verify the declared interactions.
- A `[data-viz-fallback]` element that becomes visible when an optional CDN dependency fails.
- A `[data-viz-motion]` indicator set to `full` or `reduced` from
  `matchMedia("(prefers-reduced-motion: reduce)")`.

## Interaction contract

The renderer clicks the first matching hook and asserts `[data-viz-state]` changes:

| Interaction | Hook |
|---|---|
| select | `[data-node-id]` (first node) |
| filter | first `[data-viz-filter]` |
| pan | first `[data-viz-action="pan"]` |
| zoom | first `[data-viz-action="zoom-in"]` |

Keep every declared interaction reachable at 390px. Do not hide toolbar controls behind
hover, and keep the graph readable without shrinking text: use pan/zoom/filter instead of
scaling the whole canvas down.

## Rendering rules

- Design one fixed logical canvas sized to the source SVG (1600px is the default; the whiteboard
  SVG and the HTML page share the same dimensions) and scale the whole stage to the container
  width — CSS `transform: scale()` on a fixed-size stage or SVG `viewBox` scaling. Do not build
  responsive reflow, breakpoints, or per-width adaptation. The in-document preview is
  intentionally scaled; Feishu's fullscreen button is the 1:1 reading mode. Keep every declared
  interaction reachable while the stage is scaled.
- Arrowheads: use a **fixed-size** `<marker>` (default `userSpaceOnUse`) in HTML pages — for a
  4-unit line, a head around 8×5 units reads well (`markerWidth="12" markerHeight="10"
  refX="8" refY="2.5"` with path `M0 0 L8 2.5 L0 5 z`). Do not use `markerUnits="strokeWidth"`
  there — it scales the head with line width and renders oversized in the browser. On the
  whiteboard, the marker is only a signal: Feishu replaces it with its native arrowhead, so the
  two mediums intentionally differ.
- Animated layout, force simulation, or rAF loops must stop when reduced motion is active.
- No external URLs except version-pinned, allowlisted dependencies with a visible fallback.
- All data stays local; never fetch remote data.
