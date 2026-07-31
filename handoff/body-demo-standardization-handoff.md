# DP大师正文视觉统一任务交接

> 更新时间：2026-07-31  
> 当前阶段：Task B 第二轮评审门  
> 恢复重点：先完成代表课程真实手感拍板，再决定是否推广到全部 37 课

## 当前停点

- Task A 已完成并提交为 `023125f`。
- 用户已推送 Task B 的标本场检查点 `d143b85`；当前 `HEAD`、`origin/main` 均为该提交。
- 第一轮标本场拍板已经完成：
  - 主构图：纵向仪表脊。
  - 公共交互：整体确认。
  - 视觉力度：增强演绎档。
- 14 门代表课程已实装并完成专项验证。
- 第二轮无倒计时弹窗已建立，但用户尚未保存本轮选择；不得把第二轮评审标记为完成。
- 当前工作区包含代表课程阶段的未提交改动。不要重置、覆盖或把它们误认为上次提交内容。
- 本轮没有 push、部署或执行 `pnpm release`。

完整范围、规则和勾选状态见
[`body-demo-standardization-plan.md`](body-demo-standardization-plan.md)；完整逐课事实见
[`../docs/concepts/body-demo-audit.md`](../docs/concepts/body-demo-audit.md)。

## 已完成但尚未提交的实现

- 14 门代表课程通过 `lessonStandard.ts` 获得已确认的连续仪器壳层和增强演绎标记。
- `DPViz` 的状态表已接入 `DemoTableViewport`，播放控制已接入 `InstrumentRail`。
- 课程中的直接 `PlaybackControls` 调用已收口到 `InstrumentRail`；底层播放合同、solver 和输入合同未改变。
- 五态增加颜色以外的第二编码；工具触点保持至少 44px。
- `InstrumentRail` 使用容器查询适配课程正文的实际宽度，移动端不再出现播放文字竖排、速度按钮过小或二级控制溢出。
- 矩阵幂 Demo 已移除卡片堆叠，改为连续纵向轨迹和单一剖面读数。
- 插头 DP 已新增正式可操作的六帧 Demo，包含工具轨、状态表、细节切换和移动端纵向轮廓状态脊。
- 播放架构门禁已经同步为：课程只使用 `InstrumentRail`，只有共享适配器内部可以使用 `PlaybackControls`。
- 第二轮评审弹窗位于 `/lab/body-demo-standard`，不进入导航、sitemap，并保持 `noindex`。

主要未提交文件可由 `git status --short` 和 `git diff --stat` 获取。关键新增文件：

- `site/src/components/demos/shared/lessonStandard.ts`
- `site/src/components/demos/bitmask/PlugContourDemo.tsx`
- `site/src/components/demos/bitmask/plug-contour-demo.css`
- `site/src/components/demos/bitmask/PlugContourDemo.test.tsx`
- `site/tests/browser/body-demo-standardization.spec.ts`

## 当前验证证据

以下门禁已在当前未提交工作区通过：

- `pnpm test`
- `pnpm test:unit`：9 个测试文件、41 项测试
- `pnpm lint`
- `pnpm build`：两区产物与 96 个区域 HTML 正常生成
- `pnpm exec playwright test tests/browser/body-demo-standardization.spec.ts --project=chromium`：4 项通过
- 14 门代表课程在 1440px 与 390×844 下无页面横向溢出；移动端可见控件触点不小于 44px
- 插头 DP 可从 `1 / 6` 推进到 `2 / 6`；390px 下桌面 SVG 隐藏，移动纵向状态脊显示 5 个轮廓节点

完整 `pnpm verify` 尚未执行，只有全量推广和文档同步完成后才能运行并勾选最终门禁。

## 第二轮拍板材料

评审弹窗默认建议：

- 推广判断：确认推广。
- 增强演绎力度：保持当前增强档。
- 移动端语义重排：确认当前规则。

对比图：

- `representative-a-01-light.png`
- `representative-b-lcs-dark.png`
- `representative-d-matpow-dark.png`
- `representative-g-plug-light.png`
- `representative-g-plug-mobile.png`
- `representative-review-dialog.png`

`representative-g-plug-dark.png` 是移动端语义重排完成前的旧检查图，不作为第二轮拍板证据；最终整理 handoff 资产时应删除或用当前实现重拍。

## 恢复步骤

1. 从 `site/` 运行 `pnpm build`，再以
   `node scripts/preview.mjs --host 127.0.0.1 --port 4173 --strictPort`
   启动本地预览。
2. 使用 in-app browser 打开 `/lab/body-demo-standard`。浏览器若保留
   `dpmaster:body-demo-review:v1`，页面会直接打开第二轮弹窗；否则先恢复第一轮选择。
3. 向用户展示上述真实课程对比图，等待其在无倒计时弹窗中保存选择。
4. 读取 `dpmaster:representative-demo-review:v1`：
   - `rollout=approve`、`intensity=enhanced`、`mobile=approve` 时继续推广到 37 课。
   - 其他结果先按选择修复并重新评审，不得越过评审门。
5. 全量推广后更新长期正文 Demo 标准、A–G 家族概念、逐课审计和计划勾选状态。
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
