# Prototype / Form Archetype

Use for product prototypes, lightweight forms, wizards, and local-state tools where users
type, submit, and reset without remote persistence.

## Required structure

- Title, one-line summary, and a working area with local state only.
- An input (`[data-viz-input]`), a submit control (`[data-viz-action="submit"]`), and a
  reset control. Every control uses `type="button"` or a plain text input; never submit a
  real form (forms with `action` are forbidden by policy).
- A live `[data-viz-state]` element showing the draft, the submitted result, and toggles.
- A `[data-viz-fallback]` element and a `[data-viz-motion]` indicator.

## Interaction contract

| Interaction | Hook |
|---|---|
| input | first `[data-viz-input]` (renderer types `测试` and dispatches `input`) |
| submit | first `[data-viz-action="submit"]` |
| toggle | first `[data-viz-action="toggle"]` |
| navigate | first `[data-viz-action="navigate"]` step control |

## Rendering rules

- Every state change is reflected in `[data-viz-state]` so automated verification can see it.
- Escape user text through `textContent`; never build markup from input values.
- All data stays local; reset restores the initial state without a page reload.
- No forms that navigate, no network calls, and no secrets in the page.
