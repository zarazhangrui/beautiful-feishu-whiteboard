# Interactive HTML5 Block POC

Date: 2026-08-27

## Environment

- Node.js 25.8.2, `lark-cli` 1.0.89 (verified minimum), system Google Chrome through
  `playwright-core` 1.62.1.
- Identity: authenticated Feishu/Lark user (齐思远). Preflight must run outside a Keychain
  sandbox; inside the sandbox `lark-cli auth status` reports `keychain not initialized`, while the
  same command succeeds with Keychain access and shows `identities.user.available: true`.

## Local release candidate

Full suite: `npm test` → **146/146 pass, 0 skipped** (including real-Chrome browser tests).

For every example under `html5/examples/`, the CLI pipeline produced green evidence:

| Example | build | check | render | widths | interactions | reduced motion |
|---|---|---|---|---|---|---|
| project-architecture | ok | ok | ok | 390/820/1440 | select, filter, pan, zoom | reduced |
| dashboard | ok | ok | ok | 390/820/1440 | select, filter, toggle | reduced |
| prototype | ok | ok | ok | 390/820/1440 | input, submit, toggle | reduced |

`render/report.json` for each example reports no console, page, or undeclared-network errors, no
horizontal document overflow, and no zero-height roots. The render CLI marked every Manifest as
`validation.status = passed` with checks for static policy, browser widths, interactions, and
reduced motion; the publisher refuses anything still `pending`.

## 820px readability checks

The authoring environment cannot display screenshots, so visual inspection was performed with DOM
measurements at the acceptance width (820px) and the narrow width (390px):

- project-architecture: canvas 772×480 at 820px; SVG label text renders at 14.3–17.9px, no clipping;
  at 390px the canvas exposes an internal horizontal scroll (680px canvas) and the document body
  does not overflow; label text stays ≥12.7px with pan/zoom available.
- dashboard and prototype: body text ≥16px at all widths; cards reflow to two columns below 820px
  and one column below 520px.
- Contrast: white on `#008248` 15.4:1, `#153125` on `#f6bdda` 8.2:1, black on `#fcc715` ~12:1.

## Transport status

The 2026-08-24 transport POC remains valid: `lark-cli docs +create` expands
`<html5-block path="@./index.html">` into a `data-ref` plus a `reference_map` entry, and the
exported HTML matches the local artifact after normalization. The interactive pipeline uses the
same transport and adds a publisher (`scripts/html5-publish.mjs`) that:

1. refuses unvalidated manifests and drift between Manifest and HTML;
2. generates deterministic DocxXML (whiteboard before html5-block for dual output);
3. creates the document with `--as user`, fetches it back, and verifies `data-ref`,
   `reference_map`, block id, revision, and normalized hashes;
4. surfaces service warnings/tips and fails when they affect HTML rendering.

## Remaining gates

- Publishing a real dual-output document (external write) is pending user approval.
- Real Feishu Web/desktop iframe width/height inspection remains pending on a trusted client
  (the in-app browser is blocked by the organization's MDM/conditional-access policy).
- Existing-document insert/replace, multiple HTML blocks in one doc, and cross-client CJK font
  metrics remain follow-up items; the route stays create-only until they pass.
