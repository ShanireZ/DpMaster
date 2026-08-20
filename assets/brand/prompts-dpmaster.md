# DP大师（dpmaster）— 提示词

> ★ **本项目不是 BetaPass 平台**，只借用 `BetaPass/std/` 的制作标准（五件套、画幅、安全区、
> 「先图后字」的合成纪律）。资产**不进** `BetaPass/src/web/assets/platform/`，也不登记它的
> `manifest.json`；`validate.cjs` 那条「正好 25 张」的硬断言与本项目无关。
>
> | 落位 | 路径 |
> | --- | --- |
> | 提示词（两份逐字一致） | `BetaPass/std/prompts-dpmaster.md` · `DpMaster/assets/brand/prompts-dpmaster.md` |
> | 候选与生成记录 | `BetaPass/std/candidates/dpmaster/` |
> | 成图（五件） | `DpMaster/assets/brand/` |
>
> 正文一律写工作区相对路径、不用 Markdown 相对链接 —— 两份副本要能逐字节相同。
>
> ★★ **这份文件落在 DpMaster 仓库里就进了品牌门禁的扫描范围**：
> `DpMaster/site/scripts/brand-contract.test.mjs` 递归扫仓库根下所有文本文件（跳过 `.git`、`dist`、
> `node_modules`），命中它 `forbiddenNames` 里的两个旧名就红。**改本文件时不要写出那两个旧名的
> 任何字面形态**（要确认写法去读那个测试，别在这里复述——复述本身就会踩雷）。

## 项目档案

| 项 | 值 |
| --- | --- |
| code / 显示名 | `dpmaster` / DP大师 |
| 定位 | 面向 C++ 算法学习者的动态规划交互式学习网站：讲解 + 可编辑演示 + 小游戏 + 题目索引 |
| 最终文字 | 主标「DP大师」· 副标 `DpMaster` |
| 字体 | 中文 **Noto Sans SC Bold**（站点 `--font-body`）· 拉丁 **Space Grotesk**（站点 `--font-display`，`DpMaster/site/node_modules/@fontsource/space-grotesk/`） |
| 色板 | 暖墨 `#0b0a09` · 表面 `#1a1614` · 蜜金 `#f0cd83` → `#e0a24c` · 正文暖白 `#ece7de` · 七族低饱和宝石色 |
| 背景方向 | ★ **「教学器物」**（owner 2026-08-19 拍板）：DP 表格实体化成暖墨石砖/烟熏玻璃状态格阵，蜜金光沿最优子结构逐格爬行 |

## 视觉方向

一切锚在站点的 **Warm Ink** 体系（权威是 `DpMaster/site/src/styles/tokens.css`）：暖中性近黑底、
蜜金全局强调、七部分各一枚低饱和矿物宝石色、发丝描边、弥散软阴影。**它明确取代过早期的
高饱和彩虹渐变方向**，所以任何彩虹、糖果色、蓝紫科技网格都是走回头路。

背景不走现有社交图那种「抽象光轨」，而走**器物**：把 DP 表格做成看得见摸得着的格阵——
方形状态砖、倒角、发丝金线、边缘刻度，**光是被点亮的格子自己发出来的**，不是外面打了一盏灯。
这样一眼说得清「这是讲动态规划的」，而不只是好看。

Logo 是**状态旋印**：七枚状态片旋转汇聚到中心一枚最优状态。它与站点 `site/public/favicon.svg`
是同一个概念的高精插画版——**必须认得出是同一族**（七片、旋转、中心一枚），但这次是重新生成，
不从那个 SVG 派生。

## 1. Logo 原生生成（随后抠图）

```text
Use case: logo-brand
Asset type: transparent platform logo source
Primary request: an original mark for an interactive dynamic-programming learning site — seven state fragments spinning inward and settling onto one optimal state
Subject: seven identical tapered shards arranged in a seven-fold pinwheel rotation, each shard a different low-saturation mineral gem tone, all leaning and converging toward the center; at the exact center a small faceted diamond of honey gold sits in a dark recess, lit as if it were the settled optimal value; the shards must read as one deliberate rotational system, countable at a glance
Style/medium: premium editorial identity mark, flat to slightly dimensional, precise geometric construction, mineral pigment quality rather than candy color, crisp clean edges
Composition/framing: one centered radially symmetric mark, 15% padding, the seven-fold rotation clearly countable, readable at 208px
Color palette: honey gold #f0cd83 and #e6b45c leading, low-saturation mineral accents #c8863a, #82ab9f, #d2896a, #97a06a, #a693c0, #c0899a, one shard in warm off-white #ece7de, dark warm ink #0b0a09 in the center recess; no magenta inside the subject
Scene/backdrop: perfectly flat solid #FF00FF chroma-key background for local removal
Constraints: one uniform backdrop with no shadow, gradient, texture, floor or reflection; no text; no letters; no numbers; no watermark; no frame
Avoid: rainbow saturation, candy colors, flower or petal look, pinwheel toy, loading spinner, sparkle burst, neon, glassmorphism, 3D chrome, six or eight shards, a rounded square plate behind the mark
```

抠图后入库 `DpMaster/assets/brand/dpmaster-logo.png`。

## 2. 徽章背景原生生成（3:1）

```text
Use case: stylized-concept
Asset type: platform badge background, 3:1 full-bleed
Primary request: a wide teaching-apparatus plate — a dynamic-programming table made physical, with an optimal path lighting up cell by cell
Scene/backdrop: a warm near-black ink field holding an isometric lattice of square state tiles cut from dark warm stone and smoked glass; each tile has a faint chamfered edge and a hairline honey-gold rule; a few tiles carry small engraved tick marks like a measuring instrument
Subject: right 40% holds the hero — a honey-gold light climbing diagonally through the lattice along the optimal sub-structure, the tiles it has settled glowing warm from within, thin transition arcs springing from one settled tile to the next; left 55% keeps the lattice dark, low-contrast and quiet for later typography
Style/medium: premium editorial-technical illustration, tactile stone and smoked glass, precise engineering geometry, warm ink lighting, no photorealism
Composition/framing: wide 3:1, full bleed, right focal point, clean left text-safe zone, lattice present across the whole frame
Lighting/mood: warm honey light emitted by the settled tiles themselves, everything else in deep warm shadow; studious, precise, calm
Color palette: warm ink #0b0a09 and #1a1614 base, honey gold #f0cd83 and #e0a24c light, sparse low-saturation mineral accents #82ab9f, #a693c0, #d2896a on a few distant tiles
Constraints: no text, no letters, no numbers, no logo, no watermark, no frame, no user interface, no labeled chart
Avoid: rainbow gradient, candy colors, neon cyberpunk, blue-purple tech grid, glassmorphism cards, spreadsheet screenshot, circuit board, evenly lit flat grid with no focal point, cluttered left side
```

入库 `DpMaster/assets/brand/dpmaster-badge-bg.webp`。

## 3. 竖版背景原生生成（4:5）

```text
Use case: stylized-concept
Asset type: full-height vertical key-visual background, 4:5
Primary request: a vertical view up a corridor of dynamic-programming state tiles, the optimal path climbing from the bottom edge to a single resolved tile near the top
Scene/backdrop: warm near-black space holding a tall receding lattice of square state tiles cut from dark warm stone and smoked glass, ranks narrowing with depth toward the upper third, hairline honey-gold rules and small engraved ticks along the tile edges
Subject: a honey-gold path of settled tiles climbs from the lower edge through the frame and resolves into one brighter tile high in the upper third; thin transition arcs connect the settled tiles; the exact center and lower-middle stay calm enough for a logo and two lines of typography to be added later
Style/medium: premium editorial-technical illustration, tactile stone and smoked glass, precise geometry, warm ink lighting, no photorealism
Composition/framing: 4:5 portrait, full bleed; key visual inside the central 64% safe area; top and bottom 12% expendable to responsive cropping; strong vertical perspective
Lighting/mood: light comes only from the settled tiles, deep warm shadow elsewhere; studious, precise, quietly triumphant at the top
Color palette: #0b0a09, #1a1614, honey gold #f0cd83 and #e0a24c, sparse mineral accents #82ab9f, #a693c0, #d2896a
Constraints: no text, no letters, no numbers, no logo, no watermark, no frame, no user interface, no labeled chart
Avoid: rainbow gradient, candy colors, neon, blue-purple tech grid, glassmorphism, spreadsheet screenshot, circuit board, a small logo floating in an empty box
```

入库 `DpMaster/assets/brand/dpmaster-stage-bg.webp`。

## 4. 后期合成

- **徽章**：左侧 1/4 叠 `dpmaster-logo.png`；中间两行排「DP大师」与 `DpMaster`；右侧只保留光轨 HERO。
  主标约 78px、`#ece7de`；副标 Space Grotesk 约 32px、`#e6b45c`、字距 0.10em。
- **竖版宣传图**：中央叠 Logo，下方排中文与英文；整组以垂直居中为基线。
- ★★ **主标「DP大师」是本批唯一的中西混排单行**，`DP` 走 Space Grotesk、「大师」走 Noto Sans SC Bold。
  两段**同字号并排会显得 `DP` 偏小**——拉丁大写字母高度只有汉字字面高度的七成上下。
  所以 `DP` 需单独放大约 8–12% 后**与汉字齐顶（按字形包围盒对齐，不按基线对齐）**，
  并在 `P` 与「大」之间补约 0.06em 的中西文间隙。**这一条不做，主标一眼就是歪的。**
- ✅ 2026-08-20：四项目改用独立的
  `BetaPass/std/candidates/_build/build-non-platform-assets.cjs` 按项目输出，不改平台资产管线。

## 5. 自检

- Logo 必须**数得出七片**状态片，且中心是一枚被点亮的最优状态；六片或八片即废。
- Logo 必须与 `DpMaster/site/public/favicon.svg` 认得出是同一族（七片、旋转汇聚、中心一枚）；
  像一朵花、一个加载转圈或一个风车玩具就废。
- 背景必须是**被点亮的格子自己在发光**，不是外面打了一盏聚光灯。
- 不得出现任何可读的表格标签、坐标轴文字、图例或界面控件——文字只在后期合成。
- 主标 `DP` 与「大师」齐顶；副标 `DpMaster` 大小写逐字正确（D 与 M 大写），
  不写成 `DP Master` / `Dpmaster` / `DPMASTER`。
- ★ 彩虹与糖果色是**已被取代的旧方向**，不是风格偏好问题；出现即判废重做。
