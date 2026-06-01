# Beautiful Feishu Whiteboard

[中文 README](./README.zh.md)

**A library of 24 curated colour palette styles for building gorgeous, *editable* Feishu / Lark
(飞书) whiteboards.**

This is an agent **skill** (for Claude Code and other agents that read `SKILL.md`). It is not an
auto layout chart tool. Your agent composes the layout, and these templates give it a tasteful
**colour palette and mood** plus the whiteboard medium's hard rendering rules. The result is a real,
**editable** Feishu whiteboard inside a doc, not a screenshot.

> Built from hard won, on board verified knowledge of what the Feishu SVG whiteboard renderer can and
> cannot do (native shapes only, no opacity, the text colour export quirk, and more), all captured in
> [`RULES.md`](RULES.md).

## Gallery

Every style below renders the **same content**, the three stages of LLM training, so you can compare
palettes directly. Click a name to open its template. (Text colours shown are the live board
colours.)

<table>
<tr>
<td width="50%"><a href="templates/apricot-arc/"><img src="assets/styles/apricot-arc.png" alt="Apricot Arc"/></a><br/><sub><a href="templates/apricot-arc/"><b>Apricot Arc</b></a></sub></td>
<td width="50%"><a href="templates/avocado-press/"><img src="assets/styles/avocado-press.png" alt="Avocado Press"/></a><br/><sub><a href="templates/avocado-press/"><b>Avocado Press</b></a></sub></td>
</tr>
<tr>
<td width="50%"><a href="templates/block-frame/"><img src="assets/styles/block-frame.png" alt="BlockFrame"/></a><br/><sub><a href="templates/block-frame/"><b>BlockFrame</b></a></sub></td>
<td width="50%"><a href="templates/burst-panel/"><img src="assets/styles/burst-panel.png" alt="Burst Panel"/></a><br/><sub><a href="templates/burst-panel/"><b>Burst Panel</b></a></sub></td>
</tr>
<tr>
<td width="50%"><a href="templates/cobalt-bloom/"><img src="assets/styles/cobalt-bloom.png" alt="Cobalt Bloom"/></a><br/><sub><a href="templates/cobalt-bloom/"><b>Cobalt Bloom</b></a></sub></td>
<td width="50%"><a href="templates/cobalt-glaze/"><img src="assets/styles/cobalt-glaze.png" alt="Cobalt Glaze"/></a><br/><sub><a href="templates/cobalt-glaze/"><b>Cobalt Glaze</b></a></sub></td>
</tr>
<tr>
<td width="50%"><a href="templates/confetti-wedge/"><img src="assets/styles/confetti-wedge.png" alt="Confetti Wedge"/></a><br/><sub><a href="templates/confetti-wedge/"><b>Confetti Wedge</b></a></sub></td>
<td width="50%"><a href="templates/court-press/"><img src="assets/styles/court-press.png" alt="Court Press"/></a><br/><sub><a href="templates/court-press/"><b>Court Press</b></a></sub></td>
</tr>
<tr>
<td width="50%"><a href="templates/crayon-stack/"><img src="assets/styles/crayon-stack.png" alt="Crayon Stack"/></a><br/><sub><a href="templates/crayon-stack/"><b>Crayon Stack</b></a></sub></td>
<td width="50%"><a href="templates/cut-bloom/"><img src="assets/styles/cut-bloom.png" alt="Cut Bloom"/></a><br/><sub><a href="templates/cut-bloom/"><b>Cut Bloom</b></a></sub></td>
</tr>
<tr>
<td width="50%"><a href="templates/grove-block/"><img src="assets/styles/grove-block.png" alt="Grove Block"/></a><br/><sub><a href="templates/grove-block/"><b>Grove Block</b></a></sub></td>
<td width="50%"><a href="templates/jade-lens/"><img src="assets/styles/jade-lens.png" alt="Jade Lens"/></a><br/><sub><a href="templates/jade-lens/"><b>Jade Lens</b></a></sub></td>
</tr>
<tr>
<td width="50%"><a href="templates/lime-slab/"><img src="assets/styles/lime-slab.png" alt="Lime Slab"/></a><br/><sub><a href="templates/lime-slab/"><b>Lime Slab</b></a></sub></td>
<td width="50%"><a href="templates/linen-cut/"><img src="assets/styles/linen-cut.png" alt="Linen Cut"/></a><br/><sub><a href="templates/linen-cut/"><b>Linen Cut</b></a></sub></td>
</tr>
<tr>
<td width="50%"><a href="templates/mint-brut/"><img src="assets/styles/mint-brut.png" alt="Mint Brut"/></a><br/><sub><a href="templates/mint-brut/"><b>Mint Brut</b></a></sub></td>
<td width="50%"><a href="templates/neo-grid-bold/"><img src="assets/styles/neo-grid-bold.png" alt="Neo-Grid Bold"/></a><br/><sub><a href="templates/neo-grid-bold/"><b>Neo-Grid Bold</b></a></sub></td>
</tr>
<tr>
<td width="50%"><a href="templates/papier-bleu/"><img src="assets/styles/papier-bleu.png" alt="Papier Bleu"/></a><br/><sub><a href="templates/papier-bleu/"><b>Papier Bleu</b></a></sub></td>
<td width="50%"><a href="templates/raw-grid/"><img src="assets/styles/raw-grid.png" alt="Raw Grid"/></a><br/><sub><a href="templates/raw-grid/"><b>Raw Grid</b></a></sub></td>
</tr>
<tr>
<td width="50%"><a href="templates/reading-room/"><img src="assets/styles/reading-room.png" alt="Reading Room"/></a><br/><sub><a href="templates/reading-room/"><b>Reading Room</b></a></sub></td>
<td width="50%"><a href="templates/riptide-cobalt/"><img src="assets/styles/riptide-cobalt.png" alt="Riptide Cobalt"/></a><br/><sub><a href="templates/riptide-cobalt/"><b>Riptide Cobalt</b></a></sub></td>
</tr>
<tr>
<td width="50%"><a href="templates/riso-brut/"><img src="assets/styles/riso-brut.png" alt="Riso Brut"/></a><br/><sub><a href="templates/riso-brut/"><b>Riso Brut</b></a></sub></td>
<td width="50%"><a href="templates/salmon-stamp/"><img src="assets/styles/salmon-stamp.png" alt="Salmon Stamp"/></a><br/><sub><a href="templates/salmon-stamp/"><b>Salmon Stamp</b></a></sub></td>
</tr>
<tr>
<td width="50%"><a href="templates/specimen-bold/"><img src="assets/styles/specimen-bold.png" alt="Specimen Bold"/></a><br/><sub><a href="templates/specimen-bold/"><b>Specimen Bold</b></a></sub></td>
<td width="50%"><a href="templates/violet-marker/"><img src="assets/styles/violet-marker.png" alt="Violet Marker"/></a><br/><sub><a href="templates/violet-marker/"><b>Violet Marker</b></a></sub></td>
</tr>
</table>

---

## Install

**Tell your agent** (Claude Code, etc.):

> "Install the **beautiful-feishu-whiteboard** skill from
> `github.com/zarazhangrui/beautiful-feishu-whiteboard`."

Or run the installer yourself:

```bash
# project level (./.claude/skills or your agent's skills dir)
npx skills add zarazhangrui/beautiful-feishu-whiteboard

# or globally (available in every project)
npx skills add zarazhangrui/beautiful-feishu-whiteboard -g
```

Or install manually (clone into your agent's skills folder):

```bash
git clone https://github.com/zarazhangrui/beautiful-feishu-whiteboard \
  ~/.claude/skills/beautiful-feishu-whiteboard
```

## Requirements

- **Node.js 20 or newer**
- **A Feishu / Lark account.** Boards are written into your own tenant.
- **`lark-cli`** (npm `@larksuite/cli`), installed and authenticated:
  ```bash
  npm install -g @larksuite/cli
  lark-cli config init     # first run: scan the QR code
  lark-cli auth login      # authorize your Feishu/Lark account
  ```
- **`@larksuite/whiteboard-cli`**, used via `npx`, downloads automatically, no install needed.

Run the bundled check any time: `bash scripts/preflight.sh`

## Use it

Once installed, just ask your agent in plain language. You can name a style or describe a vibe:

> - "Make a **Feishu whiteboard** explaining our onboarding flow, in the **Riso Brut** style."
> - "Turn this doc into a visual **board** in Feishu, minimal **cobalt** look."
> - "Draw the system architecture as a Feishu whiteboard, **playful candy** colours."
> - "Explain the 3 LLM training stages as a board."

Your agent will: ask what the board is for and what vibe you want, pick a fitting style from the
[catalogue](CATALOG.md), compose the diagram with native shapes, render it and self correct
(overflow, margins, overlaps), write it into a Feishu doc as an editable whiteboard, then send you
**both the doc link and the image**. You can switch to a different style any time.

## How it works

- **`SKILL.md`**: the agent entry point. When to use, the preflight, and the conversation flow
  (understand the board, ask the vibe, pick a style, build, deliver the link and image, offer to switch).
- **`CATALOG.md`**: every style with its vibe, formality level, and what it is good for, so the agent
  can pick a style that fits the content.
- **`RULES.md`**: the medium's hard limits (native shapes only, no opacity, no gradients or blur, the
  text colour export caveat) and the exact `lark-cli` and `whiteboard-cli` commands.
- **`templates/<slug>/design.md`**: one per style, just the palette and how to use its colours. The
  agent is free to lay out the content however reads best; the template only constrains colour and mood.

## License

[MIT](LICENSE) (c) Zara Zhang ([@zarazhangrui](https://github.com/zarazhangrui))

Built on Feishu/Lark's `@larksuite/cli` and `@larksuite/whiteboard-cli`.
