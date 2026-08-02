# DP大师正文视觉统一任务交接

> 更新时间：2026-08-02
> 当前阶段：Task B 完成；P1 37 门独立 Demo Hero、P2 文档刷新与最终验收均已通过
> Git：本轮只创建一个聚焦本地提交，不 push、不部署

## 完成结果

- 用户已批准 14 门代表课程的高保真方向；该方向现已从代表样例扩展到全部 37 门课程。
- catalog 中全部 37 门有效课程现在统一使用 `data-demo-standard="instrument"` 与 `data-demo-intensity="enhanced"`。
- 历史 `.demo` 统一获得纵向仪表脊、连续编号、工程网格、焦点外观与 44×44px 触控基线；新式 Demo 继续使用 `DemoWorkbench`、`InstrumentRail`、`DemoTableViewport`、`DemoDetailSwitch` 和 `VizStateRole`。
- 旧的 14 门课程白名单 `lessonStandard.ts` 已删除，正文标准不再维护会与 catalog 漂移的第二份注册表。
- 当前库存为 37 门课程、111 个正文图版、56 个真实 Demo；G/plug 已包含正式六帧交互 Demo。
- 全部 37 门课程的首个真实 Demo 均有独立透明高保真静态 Hero；37 个构建后资源 URL 互不重复，14 门代表课程继续作为视觉评审归档。
- 所有 Hero 均为空替代文本、`aria-hidden` 的纯装饰，与输入、求解和播放状态解耦；区域 6.30 MB 资源门禁保持不变。

长期事实见：

- [`../docs/concepts/body-demo-audit.md`](../docs/concepts/body-demo-audit.md)
- [`../docs/concepts/family-visual-standard.md`](../docs/concepts/family-visual-standard.md)
- [`body-demo-standardization-plan.md`](body-demo-standardization-plan.md)

## 本轮实现范围

- `site/src/assets/demo-art/`：新增此前缺失的 22 张课程 Hero，统一经透明去底与 AVIF 预算优化；删除无引用、可由 Git 恢复的旧 A/01 Hero。
- `site/src/components/demos/`：把新增资产接到 A/B/C/E/F/G 共 22 门课程的首个真实 Demo，统一使用 `DemoSculptureHero`。
- `site/tests/browser/body-demo-standardization.spec.ts`：逐路由覆盖 37 课壳层、Demo 存在性、页面溢出和 37 张 Hero 的课程专属资源合同，同时保留代表交互回归。
- `site/tests/browser/ab-lesson-hero.spec.ts`：在 37 课桌面与 390px 巡检中断言统一正文合同。

## 验证证据

- Node 内容与算法测试：236 项全部通过；Oxlint 零 warning；两区生产构建与预渲染通过。
- 定向 Chromium：正文标准化测试 10 项全部通过，其中逐路由断言 37 门 Hero 独立、纯装饰且课程专属。
- in-app browser 桌面抽查 A/multiple、B/edit、C/tree、E/inout、F/select、G/tsp：Hero 均为 600×600 独立 AVIF、展示高度 320px，页面与首 Demo 横向溢出为 0，控制台无 warning/error。
- A/multiple 的 `m` 从 13 变为 14；G/tsp 在 390×844 下点位编辑产生状态变化，两处 Hero 资源均保持不变。
- G/tsp 移动端 Hero 高 220px，27 个按钮均不小于 44×44px；深浅主题 Hero 尺寸与左侧几何一致，页面和 Demo 无横向溢出，控制台干净。
- 完整 `pnpm verify` 已通过：236 项 Node 测试、组件测试、零 warning lint、两区生产构建、46 项浏览器测试（Chromium 全量、Firefox/WebKit 冒烟）全部通过。
- 两区资产门禁：Cloudflare 278 个文件、6,283,671 bytes；EdgeOne 278 个文件、6,283,669 bytes；最大单文件 732,959 bytes。

## 边界

- 不执行 `pnpm release`、`pnpm deploy:cf`、`pnpm deploy:eo`，不把 GitHub Actions 改成部署通道。
- 不恢复“插头 DP（选修）”或任何选修定位。
- 不用卡片堆叠、桌面图缩小或右侧裁切替代移动端语义重排。
- 后续新增课程或 Demo 只从 catalog 和共享原语扩展，不恢复课程白名单。
