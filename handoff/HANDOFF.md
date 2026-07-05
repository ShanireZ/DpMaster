# DpMaster 交接文档

> 面向接手 **M2 全量建设** 的下一位 agent/开发者。本文只讲"怎么接着干"，**不重复**已有文档——细节一律指向 `01~04` 方案与 `决策日志.md`。
> 生成于 2026-07-05。

---

## 0. 一句话

**DpMaster** = 动态规划(DP)交互式教学网站。正常风格（非修真）、Warm Ink 视觉、React+Vite、精讲+重交互、例题全洛谷原生题。**方案 + M1 垂直切片（B 背包）已完工**；下一步是 **M2：并行铺开其余六大部分**。

- 本地：`D:\WorkSpace\DpMaster`（仓库根；含方案文档 + `site/` 站点代码）
- 远程：**public** [github.com/ShanireZ/DpMaster](https://github.com/ShanireZ/DpMaster) · `main` 分支 · 首提 `96a53a7`
- ⚠️ WorkSpace 本身不是 git 仓库；DpMaster 是独立仓库。**不新增 branch/worktree**（owner 铁律）。

---

## 1. 现在到哪了

| 里程碑 | 状态 |
|---|---|
| M0 方案（5 份文档） | ✅ 完工，见仓库根 `README/01~04/决策日志.md` |
| M1 脚手架 + B 背包垂直切片 | ✅ 完工（01 背包 + 完全背包两页、DP 可视化引擎、装包大师游戏） |
| M1.5 设计返修（owner 评配色土/讲解简略/latex 坏） | ✅ 完工（Warm Ink 配色、KaTeX 修复、图文并茂深化） |
| **M2 全量七部分** | ⏳ **待启动**（← 你在这里） |
| M3 全局打磨 + 部署 | 未开始 |

**唯一未决**：owner 对 M1.5 设计返修的**二次验收**尚未回。若 owner 认可，直接按 M2 推进；若还要调（如主色从蜜金换别的），先改 `tokens.css` 再铺量。

---

## 2. 怎么跑起来

```bash
# 站点在 site/ 子目录
cd D:\WorkSpace\DpMaster\site
npm install          # 若 node_modules 有问题就重装（本仓已 gitignore node_modules）
npm run dev          # Vite dev :5173
npm run build        # tsc 严格检查 + vite build → dist/（可部署静态文件）
```

- Preview 工具：`.claude/launch.json` 已配 **`dp-atlas`**（`npm run dev --prefix DpMaster/site`，:5173）。`preview_start` name=`dp-atlas`。
- ★本环境坑（见 §5）：截图必超时、dev server 会自停、`preview_click` 有时不触发 React。

---

## 3. 接手 M2 必须复用的「模板 / 契约」

M2 的核心是**让六部分风格/交互一致**。B 背包已把所有模式立好，照抄即可。

### 3.1 内容页
- 每个 DP **类型** = 一个组件 `site/src/content/<part>/<Name>.tsx`，在 `site/src/content/registry.tsx` 注册，键 `` `<pid>/<slug>` ``（如 `b/01`）。
- 样板照抄 **`site/src/content/b/Knapsack01.tsx`**（最完整）：`<section className="lesson">` + `<h2 className="section-title">` → `.prose` 讲解 → `<figure className="figure">` 插图 → `.steps/.step` 逐步卡 → `.pointer-cue` 引导 → `<InfoBox kind="warn|key">` → 演示 → `<ExampleCard>/<Field>/<Exercise>`（来自 `components/ui/ProblemBits`）→ 底部 `.type-nav`。
- 数学：`import { M, MB } from 'components/ui/Math'`（`<M>` 行内 / `<MB>` 块级）。**★公式内禁中文**（KaTeX 数学字体无 CJK），中文标注放 HTML。
- 代码：`<CodeBlock code={...} luogu="Pxxxx" />`，**ShanireZ OJ 风**（Allman/4 空格/1-based/`endl`/显式 `long long`）——可挂 `shanirez-style` 技能。
- 插图：仿 `site/src/content/b/KnapsackArt.tsx`（on-brand SVG，用 `var(--accent-1)` 等令牌随部分变色）。

### 3.2 DP 可视化引擎（全站复用中枢）
- 引擎在 `site/src/components/dp-engine/`：`types.ts`（VizModel/Frame 数据模型）+ `DPViz.tsx`（渲染：三色高亮+SVG 依赖箭头+KaTeX 联动+播放/单步/scrub）+ `useStepPlayer.ts`。
- 每个演示：写一个**步骤生成器** `site/src/components/demos/<topic>/solvers.ts`，产出 `VizModel`（`frames[]`，每帧 `{values, states, arrows, active, formula, caption}`）；再包一个可编辑输入的 Demo 组件（仿 `demos/knapsack/KnapsackDemo.tsx`），`<DPViz model={...} key={inputsHash}/>`（key 变→remount 重置播放）。
- 引擎能渲染：一维数组 / 二维表格 / 树 / 比特点阵——按部分需要给不同 `VizModel`。

### 3.3 部分元数据 / 游戏
- `site/src/data/parts.ts`：七部分与类型清单已建；**建好一个类型就把它的 `status` 从 `'planned'` 改 `'ready'`**（侧栏/部分页据此放链接）。
- 每部分一个互动游戏：`site/src/components/games/<Game>.tsx` + 在 `site/src/components/games/registry.ts` 按 part id 注册；`PartPage` 自动渲染。样板 = `games/PackMasterGame.tsx`（含 WebAudio 反馈 + "看 DP 最优"对照）。

### 3.4 设计系统（勿破坏）
- 令牌全在 `site/src/styles/tokens.css`（Warm Ink：暖墨底 + 蜜金主色 + 七部分低饱和宝石色）。部分强调色由 `[data-part]` 自动切换（`Shell` 设置）——组件用 `var(--accent-1/2)`、`var(--grad-accent)` 即可随部分变色。
- ★强调色上文字用 `var(--text-on-accent)`（暖黑），**别用白字**。
- ★**不做从 `opacity:0` 起步的进场/滚动揭示动画**（无头/后台标签页会暂停动画→内容永久隐藏，已两次踩坑）。高级感靠配色/阴影/字体/hover。

---

## 4. M2 建设计划（并行）

详见 `01-项目方案.md §7` 路线图 + `02-内容架构与洛谷选题.md`（**逐题核验的洛谷原生例题/练习全清单**，直接照用）。

- **切法**：A / C / D / E / F / G 各派一个 agent；B 需补齐其余 7 类型（01/完全已完成）。每 agent **独占** `src/content/<part>/`、其 `src/components/demos/<topic>/`、其 game 文件——**互斥文件归属**，主 agent 集成。**不建 branch/worktree**。
- **每类型交付**：精讲(图文并茂+逐步) + ≥1 可改值演示 + 2–3 例题 + 3 练习；每部分 1 游戏。
- **题目**：只用 `02` 里已核验的洛谷 **P/B 原生题**（非 remote judge）。`02 §10` 有诚实缺口清单（LCIS/打家劫舍无原生同名题的处理）与剔除题，别踩。
- **可选缩减**（若要更快出成品，见 `01 §11`）：E 换根并入 F 作专题（题池高度重叠）；每类型练习先 2 道。**须 owner 拍板**再缩。
- 每完成一批：`npm run build` 过 + preview 抽验（用 `eval` 取证，见 §5）+ 推送同仓。

---

## 5. 关键坑（★=踩过）

- ★**KaTeX**：`react-katex@3.1` 与 `katex@0.17` 不兼容会把 `\max\big` 当**字面文本**渲染。全站已改**直连 `katex.renderToString`**（`components/ui/Math.tsx`），别再引 react-katex。公式内**禁中文**。
- ★**无头预览暂停动画/IntersectionObserver**：凡 `opacity:0` 起步的进场会把内容卡成隐藏。别用。
- ★**截图工具本环境必超时**：改用 `preview_eval` 读 computed 样式 / DOM 取证；`preview_snapshot` 看结构。
- ★**`preview_click` 有时不触发 React onClick**：改用 `preview_eval` 里 `el.click()`。
- ★**dev server 会在构建后/空闲自停**：按需 `preview_start` name=`dp-atlas` 重启（serverId 每次变，用 `preview_list` 取当前）。
- ★**网络 git/gh 操作**（push、`gh repo create`）需 `dangerouslyDisableSandbox: true`。
- ★**CRLF**：Windows 上 git add 会报 LF→CRLF 警告，无碍。
- ★**shiki 打包**：已改**细粒度懒加载**（`site/src/lib/highlighter.ts`，仅 cpp+双主题+JS 引擎，无 wasm）——别退回全量 `codeToHtml`（会打进几十种语言+wasm，首屏爆到 1.4MB）。
- ★**改名残留**：目录曾从 `dp` 改 `DpMaster`（Move 退化成复制+删源，`.git` 被锁需重删）——现已干净，仅供背景。

---

## 6. 待办 / 未决（交给你或 owner）

- [ ] **owner 二次验收 M1.5 设计**（配色/图文讲解手感）——通过才大规模铺量。
- [ ] `site/README.md` 仍是 **Vite 默认模板文案**，宜换成项目说明。
- [ ] 开源**许可证**未加（教学站建议 MIT 或 CC BY-NC）——owner 定。
- [ ] 部署方式未定（`dist/` 可扔任意静态服务器；可选 GitHub Pages 自动部署）。
- [ ] M2 全量内容（六部分 + B 补齐）。

---

## 7. 参考文件（都在仓库根，别重复造）

- `README.md` — 索引与已定决策
- `01-项目方案.md` — 定位/范围/页面架构/**M2 路线图**/验收
- `02-内容架构与洛谷选题.md` — **七部分 37 类型 + 逐题核验洛谷原生题库**/复用索引/诚实缺口
- `03-设计与交互规范.md` — Warm Ink 设计系统/DP 引擎/游戏清单
- `04-技术栈与素材清单.md` — 选型/2026 许可证/免费素材/性能红线
- `决策日志.md` — 全部拍板（含 M1/M1.5）
- Claude 记忆：`dp-atlas-teaching-site-2026-07-05` 与 `dp-design-and-katex-gotchas-2026-07-05`（含本项目坑与 owner 偏好）

---

## 8. 建议调用的技能（suggested skills）

- **`high-end-visual-design`** — 铺新部分时保持设计品味一致，避免退回 AI 默认审美（owner 对配色极敏感）。
- **`shanirez-style`** — 写 C++ 例题代码时套 owner 的 OJ 风格（Allman/4 空格/1-based/`endl`/`long long`）。
- 需要**核验洛谷题**（找新题/确认原生 P/B、非 remote judge）时：`ToolSearch` 加载 `WebSearch`/`WebFetch`（洛谷题面可直接 fetch，如 `https://www.luogu.com.cn/problem/P1048`）。
- 后续继续交接时：**`handoff`** 技能。
