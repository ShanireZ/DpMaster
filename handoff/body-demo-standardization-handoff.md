# DP大师正文视觉统一任务交接

> 更新时间：2026-08-01
> 当前阶段：Task B 第二轮整改，等待 A/01 静态装饰 Hero 样机复核
> 恢复重点：先确认正文主构图的设计稿还原度，再重做代表课程评审材料；不得直接推广到 37 课

## 当前停点

- Task A 已完成并提交为 `023125f`。
- 本轮静态 Hero 修正基于 `b2e6ac4`，`origin/main` 为 `e3671da`；此前 14 门代表课程、插头 DP 与上一版 A/01 交互稿已提交。
- 第一轮标本场拍板已经完成：
  - 主构图：纵向仪表脊。
  - 公共交互：整体确认。
  - 视觉力度：增强演绎档。
- 第一轮只确认视觉方向与交互合同，不等于批准后续代表课程的实际还原度。
- 14 门代表课程虽已实装并完成工程验证，但用户明确判定第二轮视觉离设计稿太远；第二轮状态为**未通过**，旧评审材料不得继续作为通过证据。
- 当前工作区正在修正 A/01 样机：参照课程标题旁插图的策略，Hero 仅使用透明 AVIF 做静态美化，并与物品、容量、模式和 DP 播放彻底解耦。
- 本轮没有 push、部署或执行 `pnpm release`。

完整范围、规则和勾选状态见
[`body-demo-standardization-plan.md`](body-demo-standardization-plan.md)；完整逐课事实见
[`../docs/concepts/body-demo-audit.md`](../docs/concepts/body-demo-audit.md)。

## 当前 A/01 静态装饰 Hero 样机

- `KnapsackHero` 只渲染一张 `aria-hidden` 的透明 AVIF；Hero 内没有手工 polygon、SVG 路径、物品列表、容量轨道或播放状态属性。
- Hero 高度缩至桌面不超过 236px、移动端 164px，只作为正文前言，不承担算法数据表达。
- 雕塑资产为 1536×1024、41,396 bytes；图片不含标题、公式、数字或控件文本。
- 物品、容量和模式只存在于参数编辑区与 DP 模型；编辑会重建 DP 数据，但不会改变 Hero 的 DOM、图片地址或几何。
- `DPViz` 的当前格会保持在局部视窗内，位置缩略条使用真实可见比例和滚动位置。
- 参数面板默认展开，重量、价值和容量均可直接输入；支持 1–8 件物品、容量 1–60、重量 1–60、价值 1–999。
- 原有 solver、输入与播放合同未改变；上一稿为 Hero 增加的 `DPViz` 播放状态回调已删除。

## 已提交的代表课程基础

- 14 门代表课程通过 `lessonStandard.ts` 获得已确认的连续仪器壳层和增强演绎标记。
- `DPViz` 的状态表已接入 `DemoTableViewport`，播放控制已接入 `InstrumentRail`。
- 课程中的直接 `PlaybackControls` 调用已收口到 `InstrumentRail`；底层播放合同、solver 和输入合同未改变。
- 五态增加颜色以外的第二编码；工具触点保持至少 44px。
- `InstrumentRail` 使用容器查询适配课程正文的实际宽度，移动端不再出现播放文字竖排、速度按钮过小或二级控制溢出。
- 矩阵幂 Demo 已移除卡片堆叠，改为连续纵向轨迹和单一剖面读数。
- 插头 DP 已新增正式可操作的六帧 Demo，包含工具轨、状态表、细节切换和移动端纵向轮廓状态脊。
- 播放架构门禁已经同步为：课程只使用 `InstrumentRail`，只有共享适配器内部可以使用 `PlaybackControls`。
- 第二轮评审弹窗位于 `/lab/body-demo-standard`，不进入导航、sitemap，并保持 `noindex`。

代表课程基础已经包含在 `e3671da`。当前待评审样机文件可由 `git status --short` 和 `git diff --stat` 获取，关键文件：

- `site/src/assets/demo-art/knapsack-01-instrument.avif`
- `site/src/components/demos/knapsack/KnapsackHero.tsx`
- `site/src/components/demos/knapsack/KnapsackHero.test.tsx`
- `site/tests/browser/body-demo-standardization.spec.ts`

## 当前验证证据

以下门禁已在当前 A/01 静态 Hero 样机通过：

- `pnpm test:unit`：10 个测试文件、43 项测试全部通过
- `pnpm test`：231 项 Node 合同测试全部通过
- `pnpm lint`：零 warning
- `pnpm build`：两区产物与 96 个区域 HTML 正常生成
- 资源预算：241 个文件、最大区域总量 6,232,615 bytes、最大单文件 732,959 bytes，门禁通过
- 正文标准专项 Chromium：5 项全部通过；A/01 覆盖 Hero 不随数据/播放变化、自定义 4 件物品、容量 20、DP 当前格跟随与位置缩略条
- in-app browser 实测：1440×1000 下 Hero 236px，390×844 下 Hero 164px；两端均无页面横向溢出，控制台无 warning/error

完整 `pnpm verify` 尚未执行；A/01 方向通过用户复核前不得推广或勾选最终门禁。

## 第二轮状态与新拍板材料

旧代表课程截图只证明共享壳层落地，不再作为视觉通过材料。用户指出它们在材质、透视、画面密度和设计稿还原度上明显不足。

当前只提交 A/01 高保真样机复核。其策略与此前标题旁插图一致：

- 不再用手写 SVG/CSS 近似不可参数化的高精度材质。
- 高保真透明资产只承担静态美化，不烘焙也不映射动态文字、数字、控件或播放帧。
- 所有动态数据与交互都留在独立编辑区和 DP 表中；Hero 不再承担算法状态语义。
- A/01 方向确认后，才按家族逐课制作独特的高保真雕塑，并重建第二轮评审页。

第一轮若需要向用户复述，应明确为：纵向仪表脊、公共交互整体确认、增强演绎档；它是方向评审，不是本轮代表课成品验收。

## 恢复步骤

1. 从 `site/` 运行 `pnpm build`，再以
   `node scripts/preview.mjs --host 127.0.0.1 --port 4173 --strictPort`
   启动本地预览。
2. 使用 in-app browser 打开 `/part/a/01`，定位“看它一格一格长出来”，向用户展示当前高保真样机的明色、暗色和移动端实页。
3. 等待用户判断 A/01 是否已经回到设计稿方向；不要让用户在旧第二轮弹窗中保存“确认推广”。
4. 若 A/01 仍不通过，继续只改样机；若通过，再为其余代表课程制作家族化高保真雕塑并重建第二轮评审材料。
5. 新代表课程全部通过后，才推广到 37 课并更新长期正文 Demo 标准、A–G 家族概念和逐课审计。
6. 运行 Chromium 全量、Firefox/WebKit 冒烟、完整 `pnpm verify`、视觉对照和 `git diff --check`。
7. 自动总结完成事项并创建聚焦本地 commit；不 push、不部署。

## 不要做

- 不要执行 `pnpm release`、`pnpm deploy:cf` 或 `pnpm deploy:eo`。
- 不要把 GitHub Actions 改为部署通道。
- 不要在第二轮拍板前推广至全部课程。
- 不要恢复“插头 DP（选修）”或任何选修定位。
- 不要用卡片堆叠、桌面图缩小或右侧裁切替代移动端语义重排。
- 不要清理或覆盖当前未提交工作区。

## Suggested skills

- `handoff`：恢复时核对本文件、计划和当前 Git 状态。
- `high-end-visual-design`：继续视觉判断与真实课程对比。
- `build-web-apps:react-best-practices`：维护共享 React 原语和懒加载边界。
- `build-web-apps:frontend-testing-debugging`：运行浏览器门禁并定位布局漂移。
- `browser:control-in-app-browser`：展示无倒计时评审弹窗并读取用户保存结果。
