# Feishu HTML5 Block — Medium Rules

These rules apply only when the user explicitly requests a Feishu/Lark document HTML5 Block.
`RULES.md` remains the editable-whiteboard contract.

## Content and layout

- Generate a dedicated HTML-targeted SVG; share content and palette with the whiteboard version,
  but allow different geometry and density.
- Default `min_supported_width` is 720px until a later cross-client POC supersedes it. Design the
  SVG around 850–1000 logical pixels wide and keep body text at least 16px at 720px; secondary text
  may be 14px only when explicitly tagged `data-text-role="secondary"`.
- The wrapper uses `width: 100%`. Below 720px it must preserve the canvas width and expose internal
  horizontal scrolling instead of shrinking text further.
- Use `html-box-height-mode=auto`. `viewport` is blocked until its height and internal-scroll
  semantics pass the trusted-client POC; fall back to a whiteboard for a required single-screen view.
- Declare no SVG `font-family`; the HTML wrapper supplies a cross-client system CJK font stack.

## Static security boundary

- First-party, static SVG only. No scripts, event attributes, stylesheets, `foreignObject`, images,
  embedded documents, external URLs, data URLs, entities, fonts, or network requests.
- Allowed SVG elements and attributes are enforced by `scripts/lib/svg-policy.mjs`; do not bypass
  failures manually.
- The HTML wrapper must retain its deny-by-default CSP and stay under 500KB.
- One HTML artifact contains exactly one SVG.

## Build and local verification

Run from the skill directory:

```bash
bash scripts/preflight.sh --mode html5-block

node scripts/svg-to-html.mjs \
  --input diagram-html.svg \
  --output widget.html \
  --title "Visual title" \
  --description "Concise accessible description" \
  --artifact-id "stable-artifact-id" \
  --height-mode auto

node scripts/check-html5-block.mjs --input widget.html --source-svg diagram-html.svg

node scripts/render-html5-block.mjs \
  --input widget.html \
  --output-dir render-html \
  --widths 720,820,1000 \
  --narrow-width 600
```

Inspect the 820px screenshot plus the JSON report. Publishing is blocked on policy, CSP, console,
page, network, clipping, text-size, or narrow-fallback errors.

## Publish and fetch back

The verified minimum CLI for this implementation is `lark-cli 1.0.89`: version 1.0.46 lacked the
released HTML5 Block DocxXML contract, while 1.0.89 exposes it. Use explicit user identity.

In a task-local directory, reference files relative to the XML file and CLI working directory:

```xml
<title>Document title</title>
<html5-block path="@./widget.html"></html5-block>
```

```bash
lark-cli docs +create --doc-format xml --content @./document.xml --as user
lark-cli docs +fetch --doc DOC_TOKEN --detail full --as user
```

The experimental route creates a new document only. Inserting into or replacing blocks in an existing
document is blocked until the remaining update, conflict, multi-block, and trusted-client POC gates
are complete. After creation, fetch again and verify:

- the body contains `<html5-block data-ref="...">`;
- `document.reference_map["html5-block"]` contains that key and its HTML data;
- `artifact-id` and `source-svg-sha256` exist;
- structure and normalized content hash match the local artifact; record raw length only as a
  diagnostic because the service may normalize encoding or whitespace.

On an ambiguous timeout, fetch and inspect the result only when a document token was returned. If no
token was returned, stop and report that creation needs manual confirmation; never retry automatically
or blindly create a second copy.

## Deliverables

Keep the source SVG, generated HTML, browser report, and representative PNG. Tell the user that the
HTML5 Block is a static presentation and is not node-editable like the whiteboard.
