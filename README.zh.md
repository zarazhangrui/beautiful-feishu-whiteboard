# Beautiful Feishu Whiteboard（飞书画板配色库）

[English README](./README.md)

**一个包含 24 种精选配色风格的库，用来生成漂亮、可二次编辑的飞书 / Lark 画板。**

这是一个给 AI agent 用的 **skill**（适用于 Claude Code 等会读取 `SKILL.md` 的 agent）。它不是一个自动排版的图表工具：**布局由你的 agent 自己来排**，而这些模板只提供有品味的**配色与气质**，外加飞书画板渲染引擎的硬性规则。产出是一块真正可在文档里继续编辑的飞书画板，而不是一张截图。

> 这套规则来自对飞书 SVG 画板渲染引擎「能做什么、不能做什么」的实测沉淀（只支持原生图形、不支持透明度、文字颜色导出会失真等），全部写在 [`RULES.md`](RULES.md) 里。

## 风格画廊（Gallery）

下面每个风格画的都是**同一份内容**（LLM 训练的三个阶段），方便你直接对比配色。点击风格名可以打开对应模板。（图中文字颜色为真实画板上的颜色。）

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

## 安装

**直接告诉你的 agent**（Claude Code 等）：

> “帮我从 `github.com/zarazhangrui/beautiful-feishu-whiteboard` 安装 **beautiful-feishu-whiteboard** 这个 skill。”

或者自己运行安装器：

```bash
# 项目级（./.claude/skills 或你的 agent 的 skills 目录）
npx skills add zarazhangrui/beautiful-feishu-whiteboard

# 或者全局安装（每个项目都能用）
npx skills add zarazhangrui/beautiful-feishu-whiteboard -g
```

或者手动安装（clone 到 agent 的 skills 目录）：

```bash
git clone https://github.com/zarazhangrui/beautiful-feishu-whiteboard \
  ~/.claude/skills/beautiful-feishu-whiteboard
```

## 前置条件

- **Node.js 20 或更高版本**
- **一个飞书 / Lark 账号**。画板会写入你自己的租户。
- **`lark-cli`**（npm 包 `@larksuite/cli`），已安装并完成授权：
  ```bash
  npm install -g @larksuite/cli
  lark-cli config init     # 首次运行：扫码
  lark-cli auth login      # 授权你的飞书/Lark 账号
  ```
- **`@larksuite/whiteboard-cli`**，通过 `npx` 调用，自动下载，无需单独安装。

随时运行自检：`bash scripts/preflight.sh`

## 怎么用

安装后，用大白话告诉你的 agent 就行。可以指定风格，也可以描述气质：

> - “用 **Riso Brut** 风格做一块飞书画板，讲清楚我们的新人上手流程。”
> - “把这篇文档变成一块飞书画板，**极简、cobalt 蓝** 的感觉。”
> - “把系统架构画成飞书画板，**糖果色、活泼** 一点。”
> - “用一块画板讲清楚 LLM 训练的三个阶段。”

你的 agent 会：先问清楚这块画板是干什么的、你想要什么气质，从[风格目录](CATALOG.md)里挑一个合适的风格，用原生图形把图画出来，渲染后自我检查（溢出、留白、重叠等问题），写入飞书文档成为可编辑画板，然后把**文档链接和图片一起**发给你。你随时可以换一个风格。

## 工作原理

- **`SKILL.md`**：agent 的入口。包含使用时机、前置自检，以及对话流程（先搞清楚要画什么、再问气质、挑风格、生成、把链接和图片一起给用户、并告知可换风格）。
- **`CATALOG.md`**：每个风格的气质、正式程度、适合的内容类型，便于 agent 按内容挑风格。
- **`RULES.md`**：画板的硬性限制（只用原生图形、不用透明度、不用渐变和模糊、文字颜色导出失真的注意事项），以及 `lark-cli` / `whiteboard-cli` 的具体命令。
- **`templates/<slug>/design.md`**：每个风格一份，只有配色和用色说明。布局由 agent 自由发挥，模板只约束配色与气质。

## 许可

[MIT](LICENSE) (c) Zara Zhang（[@zarazhangrui](https://github.com/zarazhangrui)）

基于飞书/Lark 的 `@larksuite/cli` 与 `@larksuite/whiteboard-cli`。
