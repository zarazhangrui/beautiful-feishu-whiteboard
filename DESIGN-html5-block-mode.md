# 设计方案：为 beautiful-feishu-whiteboard 增加交互式 HTML5 Block 输出

> 状态：设计已确认，待按实施计划开发
> 日期：2026-08-25
> 结论：保留现有 SVG → 飞书白板链路；新增以 `VisualizationSpec` 为共享语义层、以 DOM/CSS/JavaScript 为主要表达方式的交互式 HTML Renderer。白板和 HTML 共享内容与主题，不共享最终 SVG 或几何布局。

---

## 1. 背景与设计纠偏

当前仓库通过 Agent 生成符合 `RULES.md` 的 SVG，再由 `whiteboard-cli` 转成飞书原生白板节点：

```text
用户需求 → 内容规划与风格选择 → SVG → whiteboard-cli
        → lark-cli whiteboard +update → 可编辑飞书白板
```

早期 HTML 方案把 HTML5 Block 理解为 SVG 的第二种发布容器，即生成窄版 SVG 后包进静态 HTML。真实产品示例表明该抽象不成立：HTML5 Block 是在文档浏览时运行完整 HTML 的网页环境，适合数据看板、交互图表、关系网络、流程编排、演示、产品原型、表单、内容工具和轻量沉浸式体验。

参考实现使用响应式 DOM/CSS 构建工具栏、指标卡片、图例和详情面板，使用 JavaScript 管理布局与交互；图形层可以是 SVG、Canvas 或图表库，并支持拖拽、平移、缩放、筛选、详情联动和全屏查看。它还会按场景决定块高度，并可以加载 CDN 依赖。

因此，本设计删除“SVG 是 HTML 模式唯一视觉中间产物”和“HTML 只负责包装 SVG”的前提，改用共享语义模型与双独立渲染器。

## 2. 目标与非目标

### 2.1 目标

1. 保持现有白板能力和默认行为不变。
2. 生成完整、响应式、可交互的 HTML 页面并写入飞书 HTML5 Block。
3. 白板与 HTML 双发时共享内容语义、数据和主题 Token。
4. 首版提供五类经过验证的交互可视化骨架，同时允许通用 HTML 表达。
5. 允许版本锁定的白名单 CDN；核心内容必须具备失败降级。
6. 建立 HTML/JavaScript 安全、浏览器、交互、性能、发布与回读门禁。
7. 支持新建文档、插入已有文档，以及白板和 HTML 写入同一文档。

### 2.2 非目标

首版不承诺：

- 在飞书文档中直接编辑 HTML 内部 DOM、图形或代码。
- 运行任意用户提供的未验证 HTML。
- 任意远程数据访问、实时同步、登录态透传或秘密注入。
- 为所有 3D、游戏和沉浸式场景提供专用模板与性能保证。
- 立即改名或拆分仓库。

## 3. 方案选择

### 3.1 共享语义模型 + 双独立渲染器（采用）

```text
用户需求
  → 内容分析
  → VisualizationSpec + Theme Tokens
  ├→ Whiteboard Renderer → SVG → 飞书白板
  └→ HTML Renderer → DOM/CSS/JS → HTML5 Block
```

`VisualizationSpec` 记录事实、数据、关系和交互意图，不记录最终坐标。白板 Renderer 继续生成符合现有规则的 SVG；HTML Renderer 根据可视化类型生成完整网页。

该方案可以结构化校验双端内容一致性，并让两种介质分别发挥可编辑白板和交互网页的优势。代价是需要新增语义协议、HTML 规则、运行时治理和测试体系。

### 3.2 未采用方案

- **Agent 分别直接生成 SVG 和 HTML**：开发快，但内容容易漂移，难以自动验证双发一致性。
- **立即拆成独立 HTML skill**：边界清楚，但会复制主题、内容理解和飞书发布流程；待 HTML 成为独立主体后再评估。

## 4. 共享语义层：VisualizationSpec

首版使用 JSON Schema 约束共享协议：

```json
{
  "version": "1.0",
  "type": "network",
  "title": "项目架构",
  "summary": "展示内容规划、双渲染器与飞书发布链路",
  "content": {
    "nodes": [], "edges": [], "metrics": [],
    "series": [], "steps": [], "annotations": []
  },
  "theme": { "palette": "<catalog-slug>", "tokens": {} },
  "interactions": ["select", "filter", "pan", "zoom"],
  "accessibility": {
    "alt": "项目架构关系图",
    "instructions": "可选择节点查看上下游关系"
  }
}
```

字段按类型选择使用；协议不保存最终 DOM、SVG path、Canvas 坐标或白板节点坐标。

双发时必须一致：标题、摘要、关键结论、节点、关系、数据系列、流程步骤、信息层级和主题色彩语义。允许几何位置、行列布局、换行，以及 HTML 独有的工具栏、筛选器、详情面板和状态不同。

## 5. 双 Renderer

### 5.1 Whiteboard Renderer

现有链路保持不变：

```text
VisualizationSpec → CATALOG 风格 → 按 RULES.md 生成 SVG
                  → whiteboard-cli → 飞书白板
```

白板继续以可编辑、可协作和适合自由画布为目标。35 套风格和 `RULES.md` 不做破坏性变更。

### 5.2 HTML Renderer

```text
VisualizationSpec
  → 选择页面骨架和图形技术
  → 生成响应式 DOM/CSS
  → 生成 SVG / Canvas / 图表配置
  → 生成 JavaScript 状态与交互
  → 完整单文件 index.html
```

页面可组合标题、摘要、工具栏、筛选器、主画布、指标卡片、图例、详情面板、操作说明和无障碍降级内容。

HTML Renderer 不以 SVG 为必经中间产物。关系图可使用交互 SVG，数据图可使用 Canvas/图表库，产品原型可直接使用语义化 DOM。

## 6. 首版可视化类型

运行时支持完整 HTML/CSS/JavaScript；首版提供五类生成骨架：

1. **数据看板与图表**：KPI、趋势、排行、地图、筛选与多图联动。
2. **关系网络与架构图**：节点、边、详情、筛选、缩放、平移与拖拽。
3. **流程、时间线与甘特图**：阶段、依赖、里程碑、进度与视图切换。
4. **演示文稿与内容型工具**：分页、章节导航、知识卡片与交互解释器。
5. **产品原型、表单与轻量互动**：本地状态、输入、校验、步骤切换与结果展示。

3D、沉浸式体验和小游戏可通过通用 HTML 模式生成，但首版不提供专用骨架，并启用更严格的性能与 `viewport` 检查。

## 7. 响应式与高度模型

HTML 模式不再定义“850–1000px SVG 逻辑宽度”，也不通过整体缩放解决文档宽度问题。

- 820px 是主要验收宽度，同时覆盖 390px 窄屏和 1440px 全屏。
- 使用 CSS Grid/Flex 与断点调整行列、侧栏、工具栏和卡片密度。
- 图表、SVG 和 Canvas 监听容器尺寸并重新计算可视区域。
- 高密度关系图使用平移、缩放、筛选和全屏，禁止整体压小文字。
- 窄屏可折叠次要面板，但不能隐藏关键事实或核心操作。
- 内容型页面和 Dashboard 默认 `auto`；单屏工具、演示、3D、游戏和内部滚动场景使用 `viewport`。
- 验证零高度、裁切、双重滚动和异常长文档。

## 8. 依赖与网络策略

采用默认拒绝、显式白名单。首版候选包括 Tailwind Browser、Lucide、Chart.js、ECharts、D3 和 Mermaid。

`html5/dependencies.json` 为每项记录精确包名和版本、允许的 HTTPS 来源、可用时的 SRI、允许场景及 CDN 失败降级要求。页面只能加载 Manifest 声明且白名单允许的依赖，不得加载未使用的库。

网络边界：

- 页面业务逻辑优先内联，核心内容和基础说明不能依赖远程接口才能显示。
- 禁止未声明的 `fetch`、XHR、WebSocket、Beacon、表单外发和统计上报。
- 禁止写入 access token、Cookie、用户身份或其他秘密。
- CDN 失败必须显示可读提示，不能只留下空白图表或失效按钮。
- 实时数据访问另行设计授权、跨域、缓存、脱敏和失败语义。

## 9. 安全模型

验证器检查最终上传的完整 HTML，而不是信任产物自报信息。

### 9.1 HTML 与资源

- 使用真正的 HTML5 Parser，校验唯一且正确 namespace 的 `html/head/body`。
- 必需 meta 是 `head` 直接子元素，并使用精确属性 allowlist。
- 禁止 meta refresh、未知 `http-equiv`、额外危险属性和未经批准的 iframe/form/navigation。
- 外部 URL 必须与 Manifest 和依赖白名单完全匹配。
- SVG 子树检查脚本、事件属性、外部 URL、CSS escape、`foreignObject` 和危险引用。

### 9.2 JavaScript

使用 JavaScript Parser/AST 检查：

- `eval`、`new Function` 和动态代码执行。
- 动态脚本注入和未声明模块加载。
- `window.open`、顶层导航、`parent`/`top` 访问。
- 未声明网络 API、持久化和外发行为。
- 用户文本未经转义直接进入 HTML/JavaScript 源码的路径。

### 9.3 CSP 与完整性

- 根据 Manifest 依赖生成 CSP；CSP 只作为纵深防御。
- 最终 HTML 哈希由发布器在文件外计算并保存到 Manifest。
- 回读后对服务端导出的完整 HTML 稳定归一化，再与上传产物比较。

## 10. 产物、目录和组件边界

每次生成保留：

```text
visualization.spec.json
visualization.manifest.json
index.html
screenshots/
```

Manifest 记录类型、协议版本、高度模式、依赖与 SRI、声明交互、浏览器目标、HTML 字节数与哈希、验证结果。写入飞书时只上传 `index.html`。

仓库新增：

```text
beautiful-feishu-whiteboard/
├── HTML5_RULES.md
├── schemas/visualization-spec.schema.json
├── html5/
│   ├── dependencies.json
│   ├── runtime/
│   ├── archetypes/{dashboard,network,flow-timeline,presentation,prototype}/
│   └── examples/
└── scripts/
    ├── html5-build.mjs
    ├── html5-check.mjs
    ├── html5-render.mjs
    └── html5-publish.mjs
```

- `HTML5_RULES.md`：结构、主题、响应式、交互、安全和视觉规则。
- Schema：共享语义协议。
- `archetypes/`：经过验证的页面骨架与生成指导，不是固定模板生成器。
- build：组装完整 HTML、必要 meta 和 Manifest。
- check：协议、HTML/JS AST、安全和依赖检查。
- render：多宽度浏览器测试、交互 smoke test 和截图。
- publish：lark-cli 写入、回读和内容核验。

## 11. Skill 路由

```text
白板、画板、可编辑图形 → whiteboard
HTML Block、交互式、Dashboard、原型、筛选或动效 → html5-block
同时要求两种输出 → 一份 VisualizationSpec，分别渲染
只说架构图、流程图、信息图 → 保持兼容，默认 whiteboard
```

只有存在飞书/Lark 文档语境时，HTML Block 路由才触发本 skill；普通网页或前端开发任务不应误触发。

仓库名暂不修改，以保持安装、发现和现有用户兼容。更新 `SKILL.md` description，明确支持飞书白板与飞书文档交互式 HTML 可视化；以后 HTML 成为独立主体时再评估拆分。

## 12. 验证体系

### 12.1 协议与静态测试

- VisualizationSpec Schema 与类型约束。
- Spec → 白板/HTML 的事实一致性。
- HTML5 结构、meta、高度模式和文件大小。
- Manifest、依赖白名单和最终 HTML 哈希。
- HTML/JavaScript/SVG 安全检查。

安全回归必须包含 namespace 伪装、meta refresh 组合、额外 style、未声明 URL、SVG CSS escape、动态脚本、代码求值、导航、父窗口访问、Manifest/hash 断链、CDATA、实体、编码和换行归一化绕过。

### 12.2 浏览器与交互测试

每份 HTML 在 390、820、1440px 下验证：

- page error、console error、failed request 与未声明网络访问。
- 横向溢出、裁切、零高度和双重滚动。
- 字号、对比度、键盘焦点与可访问名称。
- `prefers-reduced-motion` 和 CDN 断网降级。
- Manifest 声明的交互 smoke test。
- 初始渲染耗时、DOM 数量、持续动画和内存风险。

自动检查后必须实际查看 820px 截图。POC 还需在飞书 Web 和至少一个桌面端验证。

## 13. 发布与回查

写入使用 lark-cli 支持的 XML：

```xml
<html5-block path="@./index.html"/>
```

流程：

```text
生成 Spec → 生成 HTML + Manifest → 静态/安全/浏览器验证
  → lark-cli docs create/update → docs +fetch
  → 校验 data-ref 与 reference_map
  → 服务端 HTML 与本地 HTML 归一化哈希比较
  → 真实客户端 smoke test
```

发布失败不得自动退化为图片或白板；只有用户明确同意时才切换输出介质。

## 14. POC 与验收

首个 POC 生成：

1. 当前项目的交互式架构关系图。
2. 一个多指标 Dashboard。
3. 一个带本地状态的表单或产品原型。

架构图同时生成白板版和 HTML 版，并写入同一飞书文档。

验收条件：

- 双端关键事实与 VisualizationSpec 一致。
- HTML 在 390、820、1440px 可用，820px 下不缩小页面文字。
- 架构图支持节点选择、上下游详情、筛选、平移和缩放。
- CDN 正常与断网均有明确结果。
- 静态、安全、浏览器和交互测试通过。
- lark-cli 写入、fetch 回读和完整 HTML 比对通过。
- 飞书 Web 与桌面端至少各完成一次真实查看。

## 15. 迁移方案

此前“HTML 版 SVG + wrapper”实现不再继续演进：

- 删除 SVG 作为 HTML 必经中间产物的约束。
- 删除 850–1000px HTML SVG、有效字号缩放公式和静态脚本禁令。
- 保留 lark-cli 写入、回读、版本门禁、HTML5 Parser 和安全测试基础。
- 将旧 build/check/render/publish 重构为面向完整 HTML 产物。
- 保留现有白板链路、35 套主题与 `RULES.md` 行为。
- 将主题扩展为 CSS 可消费的 Token 映射。
- 静态 SVG 对照文档只作为错误方案历史实验，不作为验收样例。

## 16. 分阶段交付

### Phase 1：协议与安全基座

- VisualizationSpec Schema、Theme Token 映射。
- HTML5_RULES、依赖白名单和 Manifest。
- 面向完整 HTML 的 check/render/publish。

### Phase 2：核心骨架与 POC

- Network、Dashboard、Prototype 三类骨架。
- 当前项目交互式架构图。
- 白板与 HTML 双发文档。

### Phase 3：扩展与固化

- Flow/Timeline 和 Presentation 骨架。
- 端到端回归、真实客户端矩阵和文档。
- 根据实际使用评估是否拆分独立 HTML skill。

## 17. 关键决策

| 决策 | 结论 |
|---|---|
| 共享层 | VisualizationSpec + Theme Tokens |
| 白板输出 | SVG → whiteboard-cli |
| HTML 输出 | 独立 DOM/CSS/JS Renderer |
| SVG 在 HTML 中 | 可选图形技术，不是必经中间产物 |
| HTML 能力 | 通用交互式可视化，首版五类骨架 |
| 外部依赖 | 版本锁定白名单 CDN，优先无依赖/可内联 |
| 网络访问 | 默认拒绝，实时数据另行设计 |
| 高度 | 内容型 auto，单屏交互型 viewport |
| 默认路由 | 模糊绘图请求仍走白板 |
| 仓库定位 | 暂不改名，更新 Skill 描述 |
