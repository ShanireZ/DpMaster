# DP大师正文视觉统一任务交接

> 更新时间：2026-08-02
> 当前阶段：Task B 完成；P0、P1 与 37 课正文仪器壳层推广均已通过
> Git：P1 本地提交 `81865c0`；本轮只创建聚焦本地提交，不 push、不部署

## 完成结果

- 用户已批准 14 门代表课程的高保真方向，并明确进入 37 课推广。
- catalog 中全部 37 门有效课程现在统一使用 `data-demo-standard="instrument"` 与 `data-demo-intensity="enhanced"`。
- 历史 `.demo` 统一获得纵向仪表脊、连续编号、工程网格、焦点外观与 44×44px 触控基线；新式 Demo 继续使用 `DemoWorkbench`、`InstrumentRail`、`DemoTableViewport`、`DemoDetailSwitch` 和 `VizStateRole`。
- 旧的 14 门课程白名单 `lessonStandard.ts` 已删除，正文标准不再维护会与 catalog 漂移的第二份注册表。
- 当前库存为 37 门课程、111 个正文图版、56 个真实 Demo；G/plug 已包含正式六帧交互 Demo。
- 14 门代表课程保留独立透明高保真静态 Hero；A/complete 另有课程专用 Hero。所有 Hero 均为纯装饰，与输入、求解和播放状态解耦。
- 其余课程使用各自唯一页头图例与真实 Demo，不再追加重复静态资产；区域 6.30 MB 资源门禁保持不变。

长期事实见：

- [`../docs/concepts/body-demo-audit.md`](../docs/concepts/body-demo-audit.md)
- [`../docs/concepts/family-visual-standard.md`](../docs/concepts/family-visual-standard.md)
- [`body-demo-standardization-plan.md`](body-demo-standardization-plan.md)

## 本轮实现范围

- `site/src/pages/TypePage.tsx`：对所有有效课程写入统一正文仪器合同。
- `site/src/pages/typepage.css`：把已批准的仪表脊、编号、网格、焦点和触控规则从代表课程推广到全部课程。
- `site/tests/browser/body-demo-standardization.spec.ts`：逐路由覆盖 37 课壳层、Demo 存在性和页面溢出，并保留 14 门独立 Hero 与代表交互回归。
- `site/tests/browser/ab-lesson-hero.spec.ts`：在 37 课桌面与 390px 巡检中断言统一正文合同。
- `site/src/components/demos/shared/lessonStandard.ts` 与对应测试已删除；catalog 是唯一课程范围来源。

## 验证证据

- 单元测试：12 个文件、47 项全部通过。
- Oxlint：零 warning。
- 两区生产构建与预渲染通过。
- 定向 Chromium：正文标准化与 37 课巡检共 11 项全部通过。
- in-app browser 桌面抽查 A/multiple、B/edit、C/tree、D/matpow、E/inout、F/select、G/tsp：均为 `instrument/enhanced`、至少一个 Demo、页面与首 Demo 横向溢出为 0，控制台无 warning/error。
- B/edit 播放从暂停态进入第 1/17 步，状态和按钮均发生变化；A/multiple 的 `m` 从 13 变为 14；G/tsp 在 390×844 下点位编辑产生状态变化。
- G/tsp 移动端全部 27 个按钮不小于 44×44px，页面和 Demo 均无横向溢出；深色主题保持相同几何与交互，控制台干净。
- 完整 `pnpm verify` 已通过：46 项浏览器测试（Chromium 全量、Firefox/WebKit 冒烟）全部通过；Cloudflare 256 个文件、6,055,238 bytes，EdgeOne 256 个文件、6,055,236 bytes，最大单文件 732,959 bytes。

## 边界

- 不执行 `pnpm release`、`pnpm deploy:cf`、`pnpm deploy:eo`，不把 GitHub Actions 改成部署通道。
- 不恢复“插头 DP（选修）”或任何选修定位。
- 不用卡片堆叠、桌面图缩小或右侧裁切替代移动端语义重排。
- 后续新增课程或 Demo 只从 catalog 和共享原语扩展，不恢复课程白名单。
