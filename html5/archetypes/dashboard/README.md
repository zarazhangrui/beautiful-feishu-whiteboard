# Dashboard / Chart Archetype

Use for KPI overviews, trends, rankings, and metric views that combine summary cards with
filtering or series switching.

## Required structure

- Title and one-line summary.
- Metric cards with `data-viz-selectable` and `data-metric-id`; each card shows label,
  value, unit, and optional trend.
- A series or period switch using `[data-viz-filter]` buttons (for example 今日/本周/本月).
- Optional toggles using `[data-viz-action="toggle"]`.
- A `[data-viz-state]` panel updated on every interaction.
- A `[data-viz-fallback]` element for CDN failure and a `[data-viz-motion]` indicator.

## Interaction contract

| Interaction | Hook |
|---|---|
| select | first `[data-viz-selectable]` card |
| filter | first `[data-viz-filter]` |
| toggle | first `[data-viz-action="toggle"]` |
| hover | `mouseenter` on a selectable card that updates `[data-viz-state]` |

## Rendering rules

- Cards reflow to one column below 820px; never shrink body text below 16px.
- Series data lives in the page; switching periods updates values through `textContent`.
- If a chart library is loaded from a CDN, the semantic summary and card values must remain
  visible without it, and `[data-viz-fallback]` must appear on failure.
- Stop chart animations when `prefers-reduced-motion: reduce` is active.
