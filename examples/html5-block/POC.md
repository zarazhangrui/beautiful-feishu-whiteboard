# HTML5 Block Transport POC

Date: 2026-08-24

## Environment

- Node.js: 25.8.2
- `lark-cli`: 1.0.89
- `@larksuite/whiteboard-cli`: 0.2.13
- Browser renderer: system Google Chrome through `playwright-core` 1.62.1
- Identity: authenticated Feishu/Lark user

Version 1.0.46 exposed the older docs command surface but its installed `lark-doc` contract did not
contain HTML5 Block syntax. After `lark-cli update`, version 1.0.89 and its bundled skills document
and implement `<html5-block path="@./file.html">`. This repository therefore uses 1.0.89 as the
lowest **verified** version, not as a claim that every intermediate release was bisected.

## Transport results

`docs +create --dry-run` expanded:

```xml
<html5-block path="@./example.html"></html5-block>
```

into:

```xml
<html5-block data-ref="html5_1"></html5-block>
```

and placed the complete HTML in `reference_map["html5-block"]["html5_1"].data`. The local path was
not sent to the service unresolved.

A real mixed document was then created with one SVG whiteboard and one HTML5 Block. The create
response returned both `block_type: whiteboard` and `block_type: html5-block`, with revision 3.
`docs +fetch --detail full` returned:

- a whiteboard block with a board token;
- an HTML block with `data-ref="html5_1"` and the expected accessible description;
- `reference_map["html5-block"]["html5_1"].path` pointing to an exported HTML resource.

The exported HTML passed the repository checker with:

- bytes: 7,153
- artifact ID: `beautiful-feishu-whiteboard-architecture-v1`
- source SVG SHA-256: `033d48496e13d66b59a8eec09e2e8fc729cdb66065c1e97112f8b69effbee524`
- canonical source SVG SHA-256: `6d79bbc9d85edb7b343f5cd4898a19cca0192a1ddf101b016de6e8c151a324e0`
- normalized HTML SHA-256: `d6acd4e1e7d55df90527aa471e8b077b87e93104f491d8a60c081d5b7b20a6a8`

The local and service-exported lengths and normalized hashes matched exactly.

## Rendering results

The example and final architecture artifact rendered at 600, 720, 820, and 1000px. Reports contained
no console, page, network, clipping, text-size, or overflow-policy errors. At 600px, the document body
remained fixed while the internal canvas exposed horizontal overflow; at 720px and wider no internal
scroll was required.

The live whiteboard preview was exported and visually inspected without layout drift.

## Remaining client checks

The in-app browser was redirected to the tenant conditional-access deny page because that browser
surface did not satisfy the organization's trusted-device/MDM policy. Therefore real Feishu Web and
desktop HTML iframe width/height inspection remains pending on a trusted client. This limitation does
not invalidate the verified transport or server round trip, but keeps the HTML capability experimental.

Insert, replace, multiple-HTML-block, cross-client CJK font, and real iframe script/sandbox behavior
remain follow-up POC items. The current skill keeps scripts and remote resources forbidden regardless
of future iframe behavior.
