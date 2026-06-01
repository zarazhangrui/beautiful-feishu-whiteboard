# Beautiful Feishu Whiteboard

**A library of 24 curated colour-palette styles for building gorgeous, *editable* Feishu / Lark
(飞书) whiteboards.**

This is an agent **skill** (for Claude Code and other agents that read `SKILL.md`). It is *not* an
auto-layout chart tool — **your agent composes the layout**, and these templates give it a tasteful
**colour palette + mood** plus the whiteboard medium's hard rendering rules. The result is a real,
**editable** Feishu whiteboard inside a doc — not a screenshot.

> Built from hard-won, on-board-verified knowledge of what the Feishu SVG whiteboard renderer can and
> can't do (native shapes only, no opacity, the text-colour export quirk, etc.) — all captured in
> [`RULES.md`](RULES.md).

---

## Install

**Tell your agent** (Claude Code, etc.):

> "Install the **beautiful-feishu-whiteboard** skill from
> `github.com/zarazhangrui/beautiful-feishu-whiteboard`."

…or run the installer yourself:

```bash
# project-level (./.claude/skills or your agent's skills dir)
npx skills add zarazhangrui/beautiful-feishu-whiteboard

# or globally (available in every project)
npx skills add zarazhangrui/beautiful-feishu-whiteboard -g
```

…or install manually (clone into your agent's skills folder):

```bash
git clone https://github.com/zarazhangrui/beautiful-feishu-whiteboard \
  ~/.claude/skills/beautiful-feishu-whiteboard
```

## Requirements

- **Node.js ≥ 20**
- **A Feishu / Lark account** — boards are written into *your own* tenant.
- **`lark-cli`** (npm `@larksuite/cli`), installed and authenticated:
  ```bash
  npm install -g @larksuite/cli
  lark-cli config init     # first run: scan the QR code
  lark-cli auth login      # authorize your Feishu/Lark account
  ```
- **`@larksuite/whiteboard-cli`** — used via `npx`, downloads automatically, no install needed.

Run the bundled check any time: `bash scripts/preflight.sh`

## Use it

Once installed, just ask your agent in plain language and name a style (or describe a vibe):

> - "Make a **Feishu whiteboard** explaining our onboarding flow, in the **Riso Brut** style."
> - "Turn this doc into a visual **board** in Feishu — minimal **cobalt** look."
> - "Draw the system architecture as a Feishu whiteboard, **playful candy** colours."
> - "Explain the 3 LLM training stages as a board, **editorial / brutalist**."

Your agent will: pick the matching palette → compose the diagram with native shapes → render it,
**look at the image and self-correct** (overflow, margins, overlaps) → write it into a Feishu doc as
an editable whiteboard → and show you the link.

## The 24 styles

| Style | Palette / vibe |
|---|---|
| **Apricot Arc** | warm mid-century apricot & terracotta on cream |
| **Avocado Press** | duotone avocado-lime × French-blue |
| **BlockFrame** | maximalist candy pastels, chunky black borders + offset shadows |
| **Burst Panel** | loud marigold neobrutalist dashboard |
| **Cobalt Bloom** | oversized type, blush + electric cobalt |
| **Cobalt Glaze** | blue-and-white ceramic, cobalt on warm white |
| **Confetti Wedge** | playful pastels (pink/mint/aqua) on cool white |
| **Court Press** | grass-green sports-poster, chalk lines + dusty pink |
| **Crayon Stack** | primary-school crayon brights on white |
| **Cut Bloom** | calm periwinkle + marigold colour blocks on white |
| **Grove Block** | pink/gold/green nested in a forest-green frame |
| **Jade Lens** | calm jade greens on warm putty |
| **Lime Slab** | electric-lime SaaS, slab-weight black type |
| **Linen Cut** | mid-century primary blue/green/red on warm linen |
| **Mint Brut** | candy mint canvas, cream cards, hot-pink bands |
| **Neo-Grid Bold** | editorial panel grid, one lemon accent on putty/ink |
| **Papier Bleu** | Matisse-calm: soft aqua on warm cream, navy ink |
| **Raw Grid** | system-native brutalism, black borders + muted pastels |
| **Reading Room** | quiet literary cream, thin frame, restrained headline |
| **Riptide Cobalt** | bold cobalt × cream, low-density / high-impact |
| **Riso Brut** | neo-brutalist editorial, cream + colliding accents + offset shadows |
| **Salmon Stamp** | big stamp letters on warm salmon |
| **Specimen Bold** | type-specimen poster, one heavy word per colour block |
| **Violet Marker** | lavender field, cream card, lime highlighter accent |

Each lives in [`templates/<slug>/design.md`](templates/) as a colour palette + notes on how to use it.

## How it works

- **`SKILL.md`** — the agent entry point: when to use, the preflight, and the build → render → **view
  & self-correct** → write → verify workflow.
- **`RULES.md`** — the medium's hard limits (native shapes only, no opacity / gradients / blur, the
  text-colour export caveat) and the exact `lark-cli` / `whiteboard-cli` commands.
- **`templates/<slug>/design.md`** — one per style: just the palette + how to use its colours. The
  agent is free to lay out the content however reads best; the template only constrains *colour and
  mood*.

## Notes & limits

- Works only with **Feishu / Lark** (it writes via `lark-cli` to your tenant).
- The whiteboard renderer is a **rectangles-and-circles** tool — these styles use only native shapes;
  there are no freeform/illustrative shapes by design (they render badly).
- The board's **image export is unreliable for text colour** (often shows black) — the live doc
  renders colours correctly. Your agent knows to verify colour via the raw export or the live doc.

## License

[MIT](LICENSE) © Zara Zhang ([@zarazhangrui](https://github.com/zarazhangrui))

Built on Feishu/Lark's `@larksuite/cli` and `@larksuite/whiteboard-cli`.
