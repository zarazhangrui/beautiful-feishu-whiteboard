# 设计方案：为 beautiful-feishu-whiteboard 增加 HTML5 Block 输出后端

> 状态：待 POC 验证，未实施  
> 日期：2026-08-24  
> 设计结论：保留 SVG 作为唯一的视觉中间产物，共享内容与风格，但按目标介质分别排版 SVG；一期提供桌面优先的静态 SVG HTML5 Block 发布能力，在窄屏下以内部横向滚动保证文字可读。

---

## 1. 背景

当前仓库是一个面向 Agent 的飞书白板设计 skill。它不是直接拼装飞书白板 JSON，而是使用 SVG 作为中间格式：

```text
用户内容
  → Agent 选择风格
  → Agent 生成符合 RULES.md 的 SVG
  → whiteboard-cli 转换为飞书白板 OpenAPI 数据
  → lark-cli whiteboard +update 写入文档
  → 可编辑飞书白板
```

现有 35 个模板负责配色和视觉气质，`RULES.md` 负责约束 SVG，使其能稳定转换成飞书原生、可编辑的白板节点。

新的需求是在不破坏上述能力的前提下，让同一内容还可以通过 SVG 包装成 HTML5 Block 写入飞书文档。由于白板通常按 1600–1700 逻辑宽度排版，而文档 HTML Block 常见宽度约 820px，不能假设同一份 SVG 缩放后仍然可读：两种输出共享内容、配色和视觉气质，但允许针对介质重新排版。第一期不新建一套通用 HTML 可视化生成系统，而是为现有 SVG 工作流增加第二个发布后端。

## 2. 目标与非目标

### 2.1 目标

1. 继续以 SVG 作为唯一视觉中间产物，复用现有 35 个风格、内容规划、生成规则和视觉自检流程。
2. 支持为 HTML 介质生成更窄、更低密度的 SVG，并包装成自包含、响应式的单文件 HTML。
3. 使用 `lark-cli docs` 将 HTML 写入新建或已有飞书文档的 HTML5 Block。
4. 支持白板和 HTML5 Block 两种输出，由用户意图决定，默认保持白板行为不变。
5. 在写入前完成版本、文件大小、安全和浏览器渲染检查；写入后通过 `docs +fetch` 回查验证。
6. 将一期分为“传输链路 POC”和“实验性 HTML 输出”两个门槛；POC 未通过前不修改正式 skill 触发范围。

### 2.2 非目标

第一期明确不支持：

- 绕过 SVG，从零生成任意 DOM/CSS 页面。
- ECharts、D3、复杂 Dashboard、游戏、幻灯片或 Canvas 编辑器。
- 从外部 CDN 加载 JS、字体、图片或样式。
- 在飞书中局部编辑 HTML Block 内的形状和文字。
- 把任意不可信 HTML 直接写入飞书文档。
- 承诺任意第三方 SVG 都能转换；一期只支持本 skill 生成或通过 HTML SVG 校验器的 SVG。
- 承诺移动端或任意窄屏下无滚动重排。

这些能力如有真实需求，可在 SVG→HTML5 Block 稳定后作为独立二期设计，不在本方案中预埋复杂抽象。

## 3. 方案选择

### 3.1 方案 A：共享内容与 SVG 工作流，按介质排版（采用）

```text
                         ┌→ 白板版 SVG（1600–1700）→ whiteboard-cli → 飞书白板
内容 → 结构规划 → 风格 ──┤
                         └→ HTML 版 SVG（约 850–1000）→ HTML wrapper → HTML5 Block
```

优点：

- 最大化复用现有资产和已验证规则。
- 两种输出保持内容、信息层级、配色和视觉气质一致。
- 复用同一 SVG 语法和检查工具，仅布局密度与字号按介质调整。
- 默认白板工作流不受影响。

限制：

- HTML 模式第一期仍以 SVG 图形为主，不具备通用 Dashboard 能力。
- HTML Block 不可在飞书中局部编辑。
- 两种输出的几何布局不保证像素级一致。
- HTML 输出一期只承诺 POC 实测的桌面宽度区间；低于最小支持宽度时使用块内横向滚动。

### 3.2 方案 B：新增独立 HTML 渲染器（暂不采用）

Agent 根据同一份内容重新生成 DOM/CSS/JS。它能发挥完整浏览器能力，但需要新的布局规则、模板适配、安全模型和测试体系，且两种输出容易出现内容和视觉漂移。

### 3.3 方案 C：拆分成两个独立 skill（暂不采用）

白板和 HTML 各自维护完整工作流，边界最清楚，但会重复维护 35 个主题、内容理解和风格选择逻辑。只有二期 HTML 能力成长为独立产品后才值得拆分。

## 4. HTML5 Block 能力基线

官方 `larksuite/cli` 主干文档已描述以下 XML 写法：

```xml
<html5-block path="@./widget.html"/>
```

读取文档时，正文中的：

```xml
<html5-block data-ref="html5_1"></html5-block>
```

只是占位；HTML 数据位于 `document.reference_map["html5-block"]["html5_1"]`。如果 entry 使用 `path`，则读取对应的导出资源文件。

HTML 基础格式为：

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="use-iframe" content="true">
  <meta name="html-box-height-mode" content="auto">
  <meta name="description" content="内容摘要">
  <title></title>
</head>
<body>...</body>
</html>
```

已知约束：

| 项目 | 约束 |
|---|---|
| HTML 总长度 | 不超过 500KB |
| 常见文档可用宽度 | 约 820px；必须做响应式布局，不能把 820px 当成永远固定的 iframe 宽度 |
| 高度模式 | `auto` 或 `viewport` |
| 高度刷新 | 页面加载后追加内容不会让 CLI 自动刷新块高度 |
| 内容存储 | 正文使用 `data-ref`，真实 HTML 存储在 `reference_map` |

宽度不是固定常量。POC 必须测量飞书 Web 与桌面端的 `min_supported_width`、`typical_width` 和 `max_width`，并把结果写入 POC 记录。实现只在 `containerWidth >= min_supported_width` 时承诺无横向滚动；更窄时 SVG 保持最小宽度并由 wrapper 提供内部横向滚动，不能继续缩小到不可读。

### 4.1 发布版本门禁

主干文档存在不等于所有已发布 CLI 都支持该能力。实施前必须完成 POC，并记录：

- 第一个可用的 `lark-cli` 发布版本。
- 配套 lark-doc skill 的版本或 commit。
- 适用的飞书/Lark 租户和客户端。
- `path` 是否由 CLI 正确展开到 `reference_map`。
- 对应版本是否需要显式传 `--api-version v2`。

`scripts/preflight.sh` 必须在 HTML 模式下检查最低 CLI 版本和可用浏览器；旧版本直接给出升级提示并停止，不能把 `<html5-block path>` 原样发送后期待服务端处理。没有浏览器时按 §7.2 的降级规则处理。

在 POC 固化最低版本之前，本文中的 lark-cli 命令只表示协议意图，不作为可复制执行的最终命令。

## 5. 总体架构

### 5.1 规则分层

白板与 HTML SVG 不共用同一个 medium rules 文件：

- `RULES.md` 继续只描述 SVG→白板，保留 1600–1700、白板字体和 native-shape 转换约束，避免破坏现有用户。
- `RULES-html5-block.md` 描述 HTML 版 SVG 的支持宽度、字体、密度、安全、最大高度、浏览器验证和发布流程。
- 两个文件各自保留少量必要的共同原则，例如内容纪律、文本可读性和视觉自检。相比互相覆盖的规则，少量重复更不容易让 Agent 同时收到冲突指令。

`SKILL.md` 完成介质路由后只读取对应规则文件：白板读取 `RULES.md`，HTML5 Block 读取 `RULES-html5-block.md`。

### 5.2 共享规划与分介质生成

两种输出共享以下阶段：

1. 理解内容和用途。
2. 从 `CATALOG.md` 选择一个风格。
3. 只读取对应的 `templates/<slug>/design.md`。
4. 确定信息层级、文案和叙事结构。

随后按目标介质生成 SVG：

- **白板版 SVG**：继续使用约 1600–1700 的逻辑宽度，严格遵守 `RULES.md`，通过 `whiteboard-cli` 转换为可编辑白板。
- **HTML 版 SVG**：根据 POC 得到的 `min_supported_width` 设计，初始建议 viewBox 宽约 850–1000；减少横向并列和小字密度，遵守 `RULES-html5-block.md`。

两份 SVG 必须保持内容事实、信息层级、风格和配色一致，但允许卡片数量、换行、行列结构和几何布局不同。“双发”指同一内容的两个介质版本，不指同一个 SVG 文件未经调整直接发布两次。

每个版本都必须单独渲染并实际查看，修复溢出、重叠、裁切、边距和箭头问题。

用户要求同时双发时，在生成 SVG 前保存一份轻量内容清单，至少记录标题、章节、关键标签、数字/指标和关系。两份 SVG 完成后提取并归一化 `<text>/<tspan>`，检查清单中的关键内容没有遗漏；不引入完整 JSON 渲染模型。

### 5.3 发布路由

```text
用户明确要求白板、画板、可编辑
  → whiteboard

用户明确要求飞书 HTML Block、HTML5 Block、以 HTML 嵌入飞书文档
  → html5-block

用户只说“画图”“做视觉解释”“生成飞书图”或没有明确介质
  → whiteboard

只有在用户需求明确涉及飞书/Lark 文档时，HTML、组件等词才允许触发本 skill；
普通网站、Dashboard、网页组件或前端开发任务不应触发。
```

不根据“图表”“幻灯片”“原型”等宽泛词汇自动选择 HTML 模式。如果 HTML 是可选项而非必要条件，优先白板。

### 5.4 HTML 包装阶段

新增确定性转换脚本，将已经通过 HTML 可读性门禁的 SVG 包装成 HTML：

```text
diagram.svg
  → 校验 SVG 输入
  → 内联到 HTML shell
  → 添加响应式 CSS 和必要 meta
  → 输出 widget.html
```

包装规则：

- SVG 必须自包含并包含合法 `viewBox`。
- 转换脚本不负责智能重排。已有 SVG 如果不满足 HTML 可读性门禁，必须由 Agent 生成 HTML 版 SVG，而不是静默缩小。
- 根容器使用 `width: 100%`、`max-width: 100%`、`box-sizing: border-box`。
- 内联 SVG 使用 `display: block; width: 100%; height: auto`。
- 使用 `min_supported_width` 估算有效字号：`估算字号 = SVG 字号 × min(1, min_supported_width / viewBoxWidth)`；正文估算字号不小于 16px，次要文字不得小于 14px。该公式只做快速预检。
- wrapper 显式声明跨平台系统字体栈，例如 `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`，并让 `svg text` 继承。不得假设外部字体可加载。
- wrapper 在支持宽度内使用 `width: 100%`；低于 `min_supported_width` 时让承载 SVG 的容器横向滚动，SVG 不继续缩小。
- 默认使用 `html-box-height-mode=auto`，让内容在文档流中完整展开。
- 只有未来出现必须单屏展示或内部滚动的明确场景时才允许 `viewport`。
- `meta description` 从内容摘要生成，不包含用户指令、文件路径、风格名或工具过程。
- 包装阶段不重写 SVG 内部节点，不修改颜色、文字或几何关系；需要调整时回到 HTML 版 SVG 生成阶段。
- wrapper 添加 `<title>`、`<desc>`、`role="img"`、`aria-labelledby` 和可见 focus 样式。

第一期可以加入少量 wrapper 级增强，例如键盘可聚焦、背景适配和打印样式；不加入业务交互或远程数据加载。

HTML SVG 默认最大宽高比暂定为 3:1，POC 后按真实体验调整。超限时优先拆成多个 HTML5 Block，其次回退白板；只有用户明确需要长页或内部滚动时才选择 `viewport`。

## 6. 安全边界

HTML5 Block 是可执行网页环境，不能把浏览器能力等同于无限制能力。第一期只接受本 skill 生成或通过校验的 SVG，并采用解析器 + 元素/属性允许列表的 default-deny 策略：

- 允许 `svg`、`g`、`defs`、`marker`、`rect`、`circle`、`ellipse`、`line`、`polyline`、`text`、`tspan`，以及 marker 内的简单 `path`。
- 允许本地 fragment 引用，例如 `marker-end="url(#arrow)"`；它不是外部网络资源。
- 禁止 `<script>`、`<style>`、`foreignObject`、`image`、`iframe`、外部 `<use>` 和其他未列入允许列表的元素。
- 禁止 HTTP(S)、`data:`、`javascript:`、CSS `@import`、外部实体和危险 DOCTYPE。
- 禁止外部 stylesheet、字体、图片和其他网络资源。
- 禁止 `fetch`、XHR、WebSocket、表单提交和数据上报。
- 禁止 `eval`、`new Function`、动态脚本注入和内联事件属性。
- 禁止顶层导航、`window.open` 和访问 `parent`/`top`。
- SVG 输入禁止 `<script>`、`foreignObject`、`on*` 事件属性和外部 URL 引用。
- 禁止把 access token、cookie、文档内容、用户信息或其他秘密写入 HTML。
- 如果未来引入远程资源或 JS 交互，必须单独设计威胁模型和允许列表。

检查必须基于 XML/SVG parser 遍历 DOM，不能只用正则；其中 CSS/脚本类元素一期直接拒绝，以降低解析复杂度。实现应尝试添加严格 CSP meta，但不能假设飞书客户端一定执行该 CSP；静态 lint 和真实 iframe POC 仍是必要门禁。

POC 必须记录内联 `<script>`、事件处理和 iframe sandbox 的真实行为。第一期即使继续禁用业务脚本，也要把测试结果保存为二期交互能力是否可行的证据，避免后续重新探索。

## 7. 验证流程

### 7.1 本地静态检查

生成 HTML 后检查：

- 文件存在且 UTF-8 可读。
- 必需 meta 完整且高度模式合法。
- HTML 总字节数不超过 500KB，并预留少量协议开销余量。
- 只有一个完整 HTML 文档和一个目标 SVG。
- 不包含外部资源、危险标签和危险 JS/API。
- SVG `viewBox`、宽高和响应式样式合法。
- 按 `min_supported_width` 估算后的字号满足正文与次要文字门禁。
- wrapper 包含约定的系统字体栈，SVG text 能正确继承。
- SVG 宽高比不超过当前限制；超限时要求拆分或切换介质。

### 7.2 浏览器检查

不使用单条固定高度 Chrome 截图作为唯一验证手段。新增 Playwright/Puppeteer 风格的验证脚本，至少完成：

- 分别使用 POC 得到的最小、典型和最大支持宽度渲染。
- `auto` 模式使用 full-page screenshot，不能固定截断在 1400px。
- 捕获 `console.error`、page error 和 failed request。
- 检查水平滚动条、异常裁切和零高度内容。
- 在浏览器中读取每个 `<text>/<tspan>` 的 computed style、实际边界和变换结果，检查真实最小字号、中文换行、标题/卡片溢出和高密度区域；静态字号公式不作为最终结论。
- 在低于 `min_supported_width` 的窄宽度验证内部横向滚动能保持字号。
- 实际查看截图并按现有规则修复视觉问题。

本地截图通过后，POC 还必须在飞书 Web 和至少一个桌面端真实查看实测宽度区间内的可读性。条件允许时覆盖 macOS 与 Windows，以验证 PingFang SC、微软雅黑等不同 CJK 字体度量下的 `<text>/<tspan>` 换行和溢出。

如果环境没有可用浏览器：

- 可以生成 SVG 和 HTML 文件。
- 必须将产物标记为“未完成视觉验证”。
- 默认不写入飞书，除非用户明确接受未验证风险。

### 7.3 写入后回查

写入成功不等于 HTML Block 可用。每次 create、insert 或 replace 后必须执行最小范围 `docs +fetch` 回查：

1. 检查 `ok/result`、`warnings` 和 `tips`。
2. 获取新 block 的 `block_id`。
3. 确认正文包含 `<html5-block data-ref="...">`。
4. 确认 `reference_map` 中存在对应 entry。
5. 记录原始长度与归一化后长度；统一 BOM、换行符和尾部空白后计算内容 hash。以结构检查和归一化 hash 为主，原始长度仅用于诊断，避免服务端空白/编码归一化造成误报。
6. 在真实飞书 Web/桌面端确认块可见、高度正确且相邻资源块未受影响。

## 8. 写入流程

### 8.1 新建文档

```text
完成 POC 后固化的 docs +create 命令
  → XML 中包含 <title> 和 <html5-block path="@./widget.html"/>
  → 检查返回值
  → docs +fetch 回查 content + reference_map
```

### 8.2 插入已有文档

```text
docs +fetch 获取最新 block ID 和 revision
  → docs +update --command block_insert_after 并携带观察到的 revision
  → 获取新 block ID
  → 使用最新 revision 再次 fetch 验证
```

### 8.3 更新已有 HTML Block

HTML 内容不能在飞书中局部编辑。更新流程为：

```text
fetch 定位目标 html5-block
  → 重新生成完整 widget.html
  → block_replace 携带观察到的 revision 整块替换
  → 丢弃旧 block ID
  → fetch 新 block 和 reference_map 验证
```

所有示例最终都应显式使用目标身份（通常为 `--as user`），并遵循锁定版本对 `--api-version` 的要求。

wrapper 还应写入稳定的 `artifact-id` 和 `source-svg-sha256` meta。insert/replace 请求超时或返回不确定结果时，先 fetch 并在 `reference_map` 中查找相同 `artifact-id`；已存在则不重试插入。revision 冲突时重新 fetch、重新定位 block 并重新评估，不能沿用旧 block ID。

## 9. 实现依赖

仓库目前没有 JavaScript 依赖清单。实现 HTML 模式时新增并提交 `package.json` 与 lockfile，锁定：

- 一个不执行脚本的 XML/SVG parser，用于允许列表验证。
- `playwright-core`，连接系统已有 Chrome/Chromium，避免自动下载整套浏览器。

`scripts/preflight.sh --mode html5-block` 检查 Node、npm 依赖、lark-cli 版本和认证、系统 Chrome/Chromium。缺少浏览器时只能生成未验证的本地产物，默认不发布。

## 10. 文件变更

| 文件 | 变更 | 说明 |
|---|---|---|
| `SKILL.md` | 修改 | 增加仅限飞书上下文的输出路由；白板仍为默认 |
| `RULES-html5-block.md` | 新增 | HTML wrapper、版本、安全、浏览器和发布规则 |
| `scripts/svg-to-html.mjs` | 新增 | 将已验证 SVG 确定性包装为单文件 HTML |
| `scripts/check-html5-block.mjs` | 新增 | 检查大小、meta、外部资源和危险能力 |
| `scripts/render-html5-block.mjs` | 新增 | 浏览器渲染、截图和 console/network 检查 |
| `scripts/preflight.sh` | 修改 | 增加 HTML 模式的 CLI 版本和浏览器检查 |
| `package.json` / lockfile | 新增 | 锁定 XML parser、playwright-core 和测试命令 |
| `CATALOG.md` | 不变 | 两种输出共享同一风格选择 |
| `templates/<slug>/design.md` | 不变 | 两种 SVG 共享配色与气质，不引入 HTML 专属模板 |
| `RULES.md` | 不变 | 继续只约束白板 SVG，保护现有行为 |
| `README.md` / `README.zh.md` | 修改 | 增加实验性 HTML5 Block 输出说明，不改变仓库核心定位 |
| `examples/` | 新增 | 保存一个 SVG、生成的 HTML、截图和 POC 记录 |

不在第一期重命名仓库，也不把定位改成通用“飞书可视化 skill”。仓库仍以漂亮、可编辑的飞书白板为核心，HTML5 Block 是同一内容的另一种 SVG 发布形式。

## 11. 错误处理

| 错误 | 行为 |
|---|---|
| CLI 版本不支持 HTML5 Block | 停止并提示升级，不尝试降级写入 |
| 租户未开放 HTML5 Block | 保留本地 SVG/HTML/PNG，建议改用白板输出 |
| HTML 超过大小限制 | 停止写入；报告当前大小和需减少的字节数 |
| 检出外部资源或危险能力 | 停止写入并指出具体节点/属性 |
| 浏览器渲染失败 | 停止默认发布，保留诊断和截图 |
| 文档写入成功但 fetch 不一致 | 标记发布失败，不宣称完成；保留 block ID 供人工检查 |
| 真实客户端高度或渲染异常 | 回退白板输出，记录为兼容性问题 |
| revision 冲突 | 重新 fetch、重新定位，不使用旧 block ID 重试 |
| 写请求结果不确定 | 按 `artifact-id` 回查，存在则不重复插入 |
| SVG 超出支持宽度/高度 | 重新排版、拆分，或回退白板 |

## 12. POC 清单

在改动 `SKILL.md` 和 README 之前完成：

1. 找出并记录最低可用的 lark-cli 发布版本。
2. 验证 `path` 能展开为 `reference_map`，而不是原样发送。
3. 验证新建文档包含一个 HTML5 Block。
4. 验证向已有文档任意位置插入。
5. 验证 `block_replace` 更新并获取新的 block ID。
6. 验证 fetch 能完整取回 HTML，并可做归一化 hash 对比。
7. 验证同一文档存在多个 HTML5 Block。
8. 验证白板与 HTML5 Block 混排、移动和相邻更新。
9. 测量并记录飞书 Web、桌面端的最小、典型和最大 HTML Block 宽度，对比 `auto` 和 `viewport` 的高度表现。
10. 在最小支持宽度检查正文实际字号、中文换行和整体可读性，并验证更窄时内部横向滚动；条件允许时覆盖 macOS 与 Windows 客户端。
11. 确认 iframe sandbox、外部网络、内联脚本、事件处理、storage、导航和 CSP 的真实行为，并把结果记录为二期交互能力的可行性依据。
12. 验证 HTML 模式的 preflight 能同时识别 CLI 版本和浏览器可用性。
13. 记录租户未开放、权限不足和旧客户端的错误返回。
14. 验证 revision 冲突和写入结果不确定时不会重复插入 block。
15. 验证最大宽高比、拆分策略和多 block 长内容体验。

POC 结果写入 `examples/html5-block/POC.md`，包括版本号、命令、返回结构、截图和已知限制。

## 13. 测试与验收

### 13.1 单元/脚本测试

- 合法 SVG 能生成包含必需 meta 的 HTML。
- 缺少 `viewBox`、包含脚本或外部资源的 SVG 被拒绝。
- 白板宽且小字在最小支持宽度下不可读的 SVG 被拒绝直接包装，并提示生成 HTML 版 SVG。
- `url(#arrow)` 被允许，HTTP/data/javascript URL、事件属性和未允许元素被拒绝。
- 超过最大宽高比的 SVG 被拒绝或要求拆分。
- 大于限制的 HTML 被拒绝。
- `auto`/`viewport` 非法值被拒绝。
- 中文、XML 特殊字符和长文本不会破坏 HTML/XML。

### 13.2 Skill 路由测试

应触发 HTML 后端：

- “把这张 SVG 作为 HTML5 Block 写进飞书文档。”
- “不要白板，把刚生成的图用飞书 HTML Block 发布。”

应继续使用白板：

- “画一个飞书架构图，之后我要自己改文字。”
- “用 Riso Brut 风格做一块飞书白板。”
- “帮我画个图解释这个流程。”

不应触发本 skill：

- “做一个销售 Dashboard 网站。”
- “写一个带 ECharts 的 HTML 页面。”
- “帮我设计一个移动端原型。”

### 13.3 端到端验收

- 同一份内容能分别生成白板版 SVG 和 HTML 版 SVG，并发布为对应介质。
- 两种输出的内容事实、信息层级、配色和视觉气质一致；布局允许针对介质不同。
- 白板仍可在飞书中局部编辑。
- HTML5 Block 在实测支持宽度区间内可读、无水平滚动，正文实际字号不小于 16px；更窄时通过内部滚动保持字号。
- 写入后 fetch 的 HTML 与本地产物一致。
- 并发修改不会被静默覆盖，网络重试不会重复插入相同 `artifact-id`。
- 旧的白板用户请求行为和交付格式不发生回归。

## 14. 发布门槛与实施阶段

P0 只验证传输链路，不修改正式 `SKILL.md` description。完成安全、宽度、浏览器和幂等能力后，P4 才加入实验性 HTML 路由。正式对外宣传前至少验证一个 HTML Block 独有价值，例如 SVG 渲染保真、CSS hover/highlight，或用户明确要求 HTML Block 作为交付格式。

| 阶段 | 内容 | 完成标准 |
|---|---|---|
| P0 | CLI/租户 POC | 固化最低版本、命令和兼容性记录 |
| P1 | SVG→HTML wrapper 与静态检查 | 本地确定性生成，安全和大小测试通过 |
| P2 | 浏览器验证 | 截图、console、network 检查通过 |
| P3 | lark-cli 发布与 fetch 回查 | create/insert/replace/mixed blocks 通过 |
| P4 | 修改 SKILL.md 和规则文件 | 路由测试通过，默认白板无回归 |
| P5 | README、示例和端到端试用 | 用户可理解两种输出的差异和限制 |

## 15. 交付要求

HTML 模式交付飞书文档链接和真实渲染截图，并明确说明 HTML Block 不能在飞书中局部编辑；按需附上本地 SVG/HTML 文件。没有完成浏览器和真实文档验证时不得宣称发布完成。

## 16. 后续可能的二期能力

只有在第一期稳定并出现明确需求后，再单独评估：

- 给 SVG 节点增加 hover、tooltip、折叠或点击高亮。
- 支持不受白板 native-shape 限制的 browser-only SVG。
- 新增 DOM/CSS 图表和 Dashboard 渲染器。
- 为 HTML 模式增加专属主题语义和交互动效规范。
- 将 HTML 能力拆分成独立 skill 或独立仓库。

这些能力不得通过放宽第一期安全边界或模糊 skill 触发范围提前引入。
