# Astro 笔记网站 — 概要设计文档

> 版本: v1.0
> 日期: 2026-06-02
> 状态: 草稿
> 基于: [需求文档](./requirements.md) v1.0

---

## 目录

- [1. 总体架构](#1-总体架构)
- [2. 模块划分](#2-模块划分)
- [3. 架构决策记录 (ADR)](#3-架构决策记录-adr)
- [4. 数据流设计](#4-数据流设计)
- [5. 接口设计](#5-接口设计)
- [6. 错误处理与边界情况](#6-错误处理与边界情况)

---

## 1. 总体架构

### 1.1 架构风格：混合流水线

采用 **一体化 Astro 项目 + 独立数据处理脚本** 的混合架构，将构建过程分为三个阶段：

```
┌─────────────────────────────────────────────────────┐
│                  Sync 阶段                            │
│  sync-notes.sh: Obsidian Vault → src/content/notes/  │
└──────────────────────┬──────────────────────────────┘
                       │ *.md 文件
                       ▼
┌─────────────────────────────────────────────────────┐
│                Transform 阶段 (独立脚本)                │
│                                                      │
│  数据提取脚本 (scripts/process-data.mjs):              │
│  ├─ 扫描所有笔记，提取 Wikilinks 关系                   │
│  ├─ 收集标签及笔记-标签映射                              │
│  ├─ 计算 Backlinks（反向链接）                           │
│  └─ 生成图谱数据 (nodes + edges JSON)                  │
│                                                      │
│  输出: src/content/.data/ 下的 JSON 缓存               │
└──────────────────────┬──────────────────────────────┘
                       │ Markdown + JSON 元数据
                       ▼
┌─────────────────────────────────────────────────────┐
│                Build 阶段 (Astro SSG)                  │
│                                                      │
│  remark 插件链 — Wikilinks / Callout / Embed /        │
│                   Highlight                          │
│  页面生成 — 首页、笔记详情、标签页、搜索页、图谱页         │
│  Pagefind — 构建时全文索引                              │
│                                                      │
│  输出: dist/ 静态 HTML                                 │
└─────────────────────────────────────────────────────┘
```

### 1.2 阶段职责矩阵

| 阶段 | 位置 | 职责 | 触发方式 |
|------|------|------|----------|
| **Sync** | `scripts/sync-notes.sh` | 从 Obsidian Vault 同步笔记到项目目录 | `npm run sync` |
| **Transform** | `scripts/process-data.mjs` | 提取跨文件关系数据(Wikilinks/Tags/Backlinks/Graph) | `npm run sync` 内联调用 |
| **Build** | Astro 项目整体 | remark 渲染、页面生成、Pagefind 索引 | `npm run build` |

### 1.3 关键设计原则

1. **Obsidian 语法分两层处理**
   - Transform 阶段：处理跨文件关系（Wikilinks 映射、Backlinks、图谱）
   - Build 阶段 remark 插件：处理文件内语法（Callout、Highlight、Embed、数学公式）
   - 收益：remark 插件只需关心当前文件，无需全局视角

2. **中间数据缓存**
   - Transform 阶段输出的 JSON 被 Astro 页面直接导入
   - 避免构建时重复扫描全部文件

3. **渐进增强**
   - 核心内容（笔记正文）纯 HTML 可访问，无需 JS
   - 交互功能（图谱、搜索、主题切换）通过 JavaScript 渐进增强

---

## 2. 模块划分

系统划分为 6 个模块，每个模块有明确的职责边界。

### M1. Obsidian 兼容层 (remark 插件)

**位置：** `src/remark-plugins/`

| 插件 | 职责 | 处理方式 |
|------|------|----------|
| `remark-wikilinks.mjs` | `[[笔记名\|别名]]` → `<a href="/notes/...">` | 读取 `wikilinks.json` 映射字典 |
| `remark-obsidian-callout.mjs` | `> [!note]` → `<div class="callout callout-note">` | mdast Blockquote → Callout div |
| `remark-obsidian-embed.mjs` | `![[文件]]` → 内联 HTML（笔记/图片） | 构建时内联解析 |
| `remark-obsidian-highlight.mjs` | `==高亮==` → `<mark>` 标签 | mdast 文本节点替换 |

**接口标准：** 遵循 unified/remark 插件签名 `(processor, options) => (tree, file) => void`

### M2. 数据处理模块 (独立脚本)

**位置：** `scripts/process-data.mjs`

| 功能 | 输入 | 输出 |
|------|------|------|
| Wikilink 采集 | 所有 `*.md` 文件 | `wikilinks.json` — 笔记名到 URL 的映射字典 |
| Tag 提取 | YAML frontmatter + 正文 `#tag` | `tags.json` — 标签到笔记列表的映射 |
| Backlink 计算 | Wikilinks 映射 | `backlinks.json` — 每篇笔记的被引用列表 |
| 图谱数据生成 | Wikilinks 映射 + 笔记元数据 | `graph.json` — nodes(含大小)/edges 数组 |

**输出目录：** `src/content/.data/`（Git 不忽略，构建依赖）

### M3. 页面路由模块

**位置：** `src/pages/`

| 路由 | 文件名 | 数据依赖 | 备注 |
|------|--------|----------|------|
| `/` | `index.astro` | 笔记列表 + 标签统计 | 首页 |
| `/notes/[...path]` | `notes/[...path].astro` | 对应 .md + backlinks + tags | 动态路由，镜像 Vault 目录 |
| `/tags/` | `tags/index.astro` | `tags.json` | 标签聚合页 |
| `/tags/[tag]` | `tags/[tag].astro` | `tags.json` + 对应笔记 | 标签筛选页 |
| `/search` | `search.astro` | Pagefind 客户端索引 | 搜索页面 |
| `/graph` | `graph.astro` | `graph.json` | 图谱页面 |
| `404` | `404.astro` | 无 | 自定义 404 |

### M4. UI 组件模块

**位置：** `src/components/`

| 组件 | 职责 | 渲染方式 | 客户端 JS |
|------|------|----------|-----------|
| `Header.astro` | 顶部导航栏 | SSG | 否 |
| `Sidebar.astro` | 左侧目录树，高亮当前笔记 | SSG (接收当前路径 prop) | 否 |
| `Footer.astro` | 页脚 | SSG | 否 |
| `NoteContent.astro` | 正文容器 | SSG | 否 |
| `Backlinks.astro` | 被引用列表 | SSG (接收 backlinks prop) | 否 |
| `TagBadge.astro` | 标签徽章 | SSG | 否 |
| `TagList.astro` | 标签云/列表 | SSG | 否 |
| `SearchBox.astro` | 搜索入口 | SSG + 客户端 | 是 (Pagefind UI) |
| `GraphView.astro` | vis-network 图谱 | SSG + 客户端 | 是 (vis-network) |
| `Callout.astro` | Callout 样式包装 | SSG | 否 |
| `TableOfContents.astro` | 页面内锚点目录 | SSG + 客户端 | 是 (滚动高亮) |
| `ThemeToggle.astro` | 亮/暗切换 | SSG + 客户端 | 是 (localStorage) |

### M5. 布局与主题模块

**位置：** `src/layouts/` + `src/styles/`

| 文件 | 职责 |
|------|------|
| `BaseLayout.astro` | 全局 HTML 结构、SEO meta、字体、`data-theme` 属性 |
| `base.css` | CSS Reset + 基础排版 |
| `theme-light.css` | 亮色 CSS 自定义属性 |
| `theme-dark.css` | 暗色 CSS 自定义属性 |
| `github-markdown.css` | GitHub 风格 Markdown 渲染样式 |
| `components.css` | 所有组件样式 |

### M6. 同步模块

**位置：** `scripts/sync-notes.sh`

- 支持硬链接模式 / 复制模式（通过参数切换）
- 自动排除：`.obsidian/`、`.trash/`、`*.canvas`、`*.excalidraw`
- 同步完成后自动调用 `process-data.mjs`

### 模块依赖关系

```
M6 (Sync) ───→ src/content/notes/ ───→ M2 (Transform)
                                              │
                     ┌────────────────────────┤
                     ▼                        ▼
              M3 (Pages) ─────────→ M1 (remark 插件)
                     │                        │
                     ▼                        ▼
              M4 (Components) ←──── M5 (Layout/Style)
```

---

## 3. 架构决策记录 (ADR)

### ADR-1: Wikilink 采用两阶段解析

**状态：** 已决定

**背景：** `[[笔记名]]` 的解析需要知道所有笔记的路径，但 remark 插件处理单个文件时没有全局视角。

**决策：**
- 阶段 1 (Transform)：扫描所有 `.md`，建立 `笔记名 → URL path` 映射字典 → `wikilinks.json`
- 阶段 2 (remark-wikilinks 插件)：读取该字典，将 `[[笔记名\|别名]]` 解析为 `<a href="/notes/...">别名</a>`

**备选方案：**
- 在 remark 插件中二次扫描文件系统 — 每次构建重复扫描，性能差
- 在 Astro 的 `getCollection()` 中注入 — 与 Astro 版本耦合，不通用

**后果：**
- 正面：remark 插件无状态、可独立测试；映射只需计算一次
- 负面：Transform 阶段必须在 Build 之前运行；添加新笔记后需重新运行 Transform

### ADR-2: Obsidian 语法全部在 remark 层级处理

**状态：** 已决定

**决策：** 所有 Obsidian 扩展语法（Wikilinks、Callout、Embed、Highlight）均通过 **remark 插件**操作 mdast 节点树实现，不涉及 rehype（HAST）层。

**后果：**
- 正面：与 remark-math、remark-gfm 等生态插件无缝协作；处理链清晰
- 负面：需要熟悉 mdast 节点类型（而非更直观的 HTML）

### ADR-3: 图谱数据构建时预生成

**状态：** 已决定

**决策：** 图谱的 nodes + edges 在 Transform 阶段计算为 `graph.json`，构建时注入到页面 `<script>` 标签。客户端仅负责 vis-network 渲染。

**备选方案：**
- 客户端扫描全站 Wikilinks 动态构建 — 需要额外 HTTP 请求，增加客户端计算开销

**后果：**
- 正面：零运行时计算，无额外网络请求
- 负面：单文件 graph.json 在笔记量极大（>10k）时体积较大；静态站点场景下可接受

### ADR-4: 使用 Pagefind 作为搜索方案

**状态：** 已决定

**决策：** Pagefind 专为静态站点设计，构建时自动扫描 HTML 生成全文索引，客户端无依赖。

**备选方案：**
- Lunr.js — 需在构建时预生成 JS 索引包，大站点索引体积膨胀
- Fuse.js — 客户端全量加载数据做模糊匹配，不适合大量内容

**后果：**
- 正面：零运行时依赖、使用简单、UI 可定制
- 负面：不支持模糊搜索 / 拼音搜索（本项目不需要）

### ADR-5: 主题系统纯 CSS 变量驱动

**状态：** 已决定

**决策：** 亮/暗主题分别定义为 CSS 变量文件，通过 `<html data-theme="dark">` 切换。用户选择存储在 `localStorage`，通过 `<head>` 内联脚本防止闪烁。

**后果：**
- 正面：无 JS 运行时开销、切换无闪烁
- 负面：不支持动态创建自定义主题（需求未要求）

### ADR-6: 不使用客户端路由 (SPA)

**状态：** 已决定

**决策：** 纯 SSG，页面间导航使用原生 `<a>` 标签跳转，不引入 Astro view transitions 或任何 SPA 框架。

**备选方案：**
- Astro View Transitions — 增加 JS 体积；笔记站点的页面切换动画收益有限

**后果：**
- 正面：极简 JS 体积、所有页面独立可访问、SEO 友好
- 负面：页面切换有完整加载（但静态站点缓存友好，感知性能可接受）

### ADR-7: 图片嵌入使用构建时复制 + 相对路径

**状态：** 已决定

**决策：** 笔记中的 `![[image.png]]` 引用的图片在 Sync 阶段随笔记一起复制到 `public/` 目录下对应路径，remark-obsidian-embed 插件将其解析为 `<img src="/notes/path/to/image.png">`。

**备选方案：**
- Astro 的 `<Image>` 组件 — 需要显式 import，不适用于 Obsidian 笔记自动处理
- 构建时 import 所有图片 — 不可控，构建时间暴涨

**后果：**
- 正面：简单直接，图片无需额外处理
- 负面：图片不做优化（压缩、responsive），但个人笔记站场景下可接受

---

## 4. 数据流设计

### 4.1 构建时数据流

```
Obsidian Vault
    │
    │  npm run sync (sync-notes.sh → process-data.mjs)
    ▼
src/content/notes/*.md
    │
    │  process-data.mjs
    ▼
┌─────────────────────────────────────┐
│  扫描全部 .md 文件                     │
│  ├─ 解析 YAML frontmatter            │
│  ├─ 正则提取 [[Wikilinks]]           │
│  ├─ 正则提取正文中 #tags              │
│  └─ 整理文件创建/修改时间              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  数据聚合                             │
│  ├─ 建立 slug → URL path 映射        │
│  ├─ 按笔记聚合 backlinks              │
│  ├─ 按标签聚合笔记列表                 │
│  └─ 生成图结构 nodes / edges          │
└──────────────┬──────────────────────┘
               │
               ▼
       src/content/.data/
    ├── wikilinks.json     → remark-wikilinks 插件
    ├── tags.json          → /tags 路由
    ├── backlinks.json     → Backlinks.astro 组件
    └── graph.json         → GraphView.astro 组件
               │
               │  npm run build → Astro SSG
               ▼
┌─────────────────────────────────────┐
│  Astro 构建过程                        │
│                                      │
│  1. 读取 src/content/notes/*.md       │
│  2. remark 插件链:                    │
│     ├─ remark-math (KaTeX)           │
│     ├─ remark-wikilinks               │
│     ├─ remark-obsidian-callout        │
│     ├─ remark-obsidian-embed          │
│     └─ remark-obsidian-highlight      │
│  3. rehype 处理 (代码高亮等)           │
│  4. Astro 页面生成 (注入 .data/ JSON)  │
│  5. Pagefind 后处理索引               │
└──────────────┬──────────────────────┘
               │
               ▼
          dist/ (静态站点)
```

### 4.2 运行时数据流

| 页面类型 | JS 需求 | 数据来源 |
|----------|---------|----------|
| 笔记详情页 | 主题切换 + TOC 滚动高亮 | 服务端预渲染 HTML |
| 图谱页 | vis-network 渲染 | 页面中内联的 graph.json |
| 搜索页 | Pagefind UI | 构建时生成的分片索引 |
| 标签页 / 首页 / 404 | 无 JS 也可用 | 纯静态 HTML |

---

## 5. 接口设计

### 5.1 remark 插件接口

每个 remark 插件遵循 unified 标准签名：

```js
/** @type {import('unified').Plugin<[Options?], import('mdast').Root>} */
function remarkWikilinks(options = {}) {
  const { wikilinkMap } = options; // 从 wikilinks.json 注入
  return (tree, file) => {
    // 遍历 mdast 树，替换 Wikilink 文本节点
  };
}
```

插件间通过 `options` 传递配置，不修改 `file.data`。

### 5.2 中间数据格式

#### wikilinks.json

```json
{
  "笔记A": {
    "path": "/notes/笔记A",
    "slug": "notes/笔记A"
  },
  "笔记A|别名": {
    "path": "/notes/笔记A",
    "slug": "notes/笔记A",
    "alias": "别名"
  }
}
```

#### backlinks.json

```json
{
  "notes/笔记A": [
    {
      "source": "/notes/笔记B",
      "sourceTitle": "笔记B",
      "displayText": "笔记A"
    }
  ]
}
```

#### tags.json

```json
{
  "javascript": {
    "notes": [
      { "path": "/notes/javascript/概述", "title": "JavaScript 概述" }
    ],
    "count": 1
  }
}
```

#### graph.json

```json
{
  "nodes": [
    { "id": "notes/笔记A", "label": "笔记A", "size": 5 }
  ],
  "edges": [
    { "from": "notes/笔记A", "to": "notes/笔记B" }
  ]
}
```

### 5.3 Astro 组件 Props 接口

| 组件 | Props 接口 |
|------|-----------|
| `Sidebar` | `{ currentPath: string; noteTree: TreeNode[] }` |
| `Backlinks` | `{ backlinks: BacklinkItem[] }` |
| `TagBadge` | `{ tag: string; size?: 'sm' \| 'md' \| 'lg' }` |
| `TagList` | `{ tags: TagItem[]; layout?: 'cloud' \| 'list' }` |
| `TableOfContents` | `{ headings: { id: string; text: string; depth: number }[] }` |
| `Callout` | `{ type: string }` (children 为插槽) |
| `GraphView` | `{ data: GraphData }` |
| `SearchBox` | 无 props（Pagefind 自动挂载） |

---

## 6. 错误处理与边界情况

| 场景 | 处理方式 |
|------|----------|
| Wikilink 指向不存在的笔记 | 渲染为 `<a class="wikilink-broken">笔记名</a>`（红色虚线样式） |
| Embed 引用不存在的文件 | 渲染为 `<span class="embed-broken">⚠️ 文件不存在</span>` |
| YAML frontmatter 格式错误 | 跳过 frontmatter 解析，仅渲染正文，控制台告警 |
| Callout 嵌套过深 | CSS 限制最大嵌套 3 层，超出后平铺展示 |
| 标签名含空格或特殊字符 | Transform 阶段做 URL 编码 |
| 笔记文件名含中文字符 | Transform 阶段建立 slug 映射，URL 中使用编码后的 slug |
| 重名笔记 | 按目录路径区分，Transform 检测冲突并告警 |
| Vault 同步路径不存在 | sync-notes.sh 错误退出，提示用户检查路径 |
| Pagefind 索引失败 | 构建时非致命告警，搜索页降级为"搜索暂不可用"提示 |

---

> 文档版本: v1.0 · 最后更新: 2026-06-02 · 基于需求文档 [requirements.md](./requirements.md)
