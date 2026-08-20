<!-- source: BetaPass\std\candidates\dpmaster\notes.md -->

> 归档说明（2026-08-20）：以下路径是生成当时的历史记录；当前采用源统一为本目录下
> `dpmaster-logo-source.png`、`dpmaster-badge-bg-source.png`、`dpmaster-stage-bg-source.png`。

# DpMaster 原生候选图生成记录

- 日期：2026-08-20（Asia/Shanghai）
- 工具：Codex 内置 `image_gen`
- 执行方式：三个资产分别独立调用一次内置生成工具；未合成五件套

## Logo

最终 prompt：

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

- 内置生成路径：`C:\Users\SkySa\.codex\generated_images\01a01cb2-f669-7023-a3f9-d66659d9078a\exec-9e77107d-1e30-4fe9-905f-2ec454e8d78a.png`
- 候选路径：`D:\WorkSpace\BetaPass\std\candidates\dpmaster\logo-source.png`

## 3:1 徽章背景

最终 prompt：

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

- 内置生成路径：`C:\Users\SkySa\.codex\generated_images\01a01cb2-f669-7023-a3f9-d66659d9078a\exec-b4c4faa9-b6f5-4f98-a3ad-e9a86ceb7086.png`
- 候选路径：`D:\WorkSpace\BetaPass\std\candidates\dpmaster\badge-bg-source.png`

## 4:5 竖版背景

最终 prompt：

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

- 内置生成路径：`C:\Users\SkySa\.codex\generated_images\01a01cb2-f669-7023-a3f9-d66659d9078a\exec-52430613-f97b-4414-853b-6fe980ae0084.png`
- 候选路径：`D:\WorkSpace\BetaPass\std\candidates\dpmaster\stage-bg-source.png`
