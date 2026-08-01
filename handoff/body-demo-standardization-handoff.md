# DP大师正文视觉统一任务交接

> 更新时间：2026-08-01
> 当前阶段：Task B 第二轮整改；A/01 方向已确认，B/LCS 第二家族样例已落地
> 恢复重点：先复核 B/LCS 的家族化 Hero 与窄屏数据编辑，再继续其余代表课程；不得直接推广到 37 课

## 当前停点

- Task A 已完成并提交为 `023125f`。
- `origin/main` 为 `ecdd824`；pnpm 初始化修复已在 CI #77 生效。该轮随后暴露浅克隆造成的 SEO 日期漂移，本地已为 CI checkout 补全 Git 历史，并修正仍引用退役 `.dpviz__scroll` 的浏览器合同。
- 11 张家族路由透明插画已从 1536×1024 WebP 收敛为 1152×768 AVIF；视觉构图与透明边界不变，区域产物回收约 608 KB，为后续独立家族资产恢复预算空间。
- 第一轮标本场拍板已经完成：
  - 主构图：纵向仪表脊。
  - 公共交互：整体确认。
  - 视觉力度：增强演绎档。
- 第一轮只确认视觉方向与交互合同，不等于批准后续代表课程的实际还原度。
- 14 门代表课程虽已实装并完成工程验证，但用户明确判定第二轮视觉离设计稿太远；第二轮状态为**未通过**，旧评审材料不得继续作为通过证据。
- 用户已确认 A/01 当前方向基本成立；当前样机扩展到 A/01、完全背包与 B/LCS。三者均参照课程标题旁插图策略，Hero 只承担静态美化，与可编辑数据、模式和 DP 播放彻底解耦。
- 本轮没有 push、部署或执行 `pnpm release`。

完整范围、规则和勾选状态见
[`body-demo-standardization-plan.md`](body-demo-standardization-plan.md)；完整逐课事实见
[`../docs/concepts/body-demo-audit.md`](../docs/concepts/body-demo-audit.md)。

## 当前 A/01、完全背包与 B/LCS 静态装饰 Hero 样机

- `KnapsackHero` 只渲染一张 `aria-hidden` 的透明 AVIF；Hero 内没有手工 polygon、SVG 路径、物品列表、容量轨道或播放状态属性。
- Hero 调整为桌面最高 360px、移动端 220px，并使用完整 `contain` 展示资产；不再通过负偏移裁切图片，仍只作为正文前言。
- 新版静态资产为 1536×1024、52,926 bytes；有效像素上下余量为 239/240px，消除了原图约 117px 的上下失衡。
- 左侧三件物品归入同一个中性托盘；删除断线、分支、连接节点和激活色，不再用装饰 Hero 暗示取舍状态。图片不含标题、公式、数字或控件文本。
- 完全背包使用独立的 1152×768、39,711 bytes 透明 AVIF：补给箱和宽口背包中陈列多枚相同物体，表达“同一种可重复取用”；不复用 A/01 的物品托盘、背包轮廓或资产地址。
- 物品、容量和模式只存在于参数编辑区与 DP 模型；编辑会重建 DP 数据，但不会改变 Hero 的 DOM、图片地址或几何。
- `DPViz` 的当前格会保持在局部视窗内，位置缩略条使用真实可见比例和滚动位置。
- 表格内容下沿与原生横向滚动条之间保留一个共享间隔，位置缩略条再独立位于视窗之外，避免三者贴边混成一层。
- 参数面板默认展开，重量、价值和容量均可直接输入；支持 1–8 件物品、容量 1–60、重量 1–60、价值 1–999。
- 参数面板标题收口为“自主设计数值”；终止型播放轨使用 16px 收尾，不再叠加通用 Demo 壳的 57.6px 底部留白。
- 参数区使用自身宽度而非页面宽度决定排版；窄容器中的物品卡最高 224px，重量/价值改为上下两行以保留 44px 触控按钮。320px 下卡宽 196px，360–768px 下保持 224px，无内部溢出。
- DP 表格视窗与右侧外壳保持 16px 实体缓冲；该留白位于滚动区外，不会伪造额外滚动距离。
- 播放轨在自身宽度不超过 575px 时将播放与倍速紧凑同排、进度独占下一排；更窄时按播放、进度、倍速三排排列，消除了页面 720px 附近的错误换行。
- 320px 顶栏只保留当前课程面包屑，隐藏重复的上级路径与分隔符，避免多行竖排和课程名截断。
- A/01 仪器章节取消 Demo 末尾 88px 与章节 142px 的重复间距，下一章节统一以最高 96px 进入；原实测 230px 空洞不再保留。
- 原有 solver、输入与播放合同未改变；上一稿为 Hero 增加的 `DPViz` 播放状态回调已删除。
- B/LCS 使用独立的 960×450、10,575 bytes 透明 AVIF：两条平行序列轨道之间只有四条不交叉的青绿色对应桥，材质沿用标题插图的象牙切面与金属连杆，但不复制 A/01 或完全背包构图。
- `LCSHero` 只包含装饰图片，不含 SVG、字符、匹配状态或播放步属性；Hero 高度在 180–320px 间自适应并完整 `contain`，字符和匹配结果只存在于下方编辑器与 DP 表。
- LCS 字符卡固定为最高 132px 的紧凑网格，切换与删除触点均至少 44px；局部高权重样式避免共享控件 CSS 的加载顺序重新放大卡片或造成点击遮挡。

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

代表课程基础已经包含在历史提交中。当前待评审的 B/LCS 样例关键文件：

- `site/src/assets/demo-art/knapsack-01-instrument-v2.avif`
- `site/src/assets/demo-art/knapsack-complete-instrument-v1.avif`
- `site/src/components/demos/knapsack/KnapsackHero.tsx`
- `site/src/components/demos/knapsack/KnapsackHero.test.tsx`
- `site/src/assets/demo-art/lcs-instrument-v1.avif`
- `site/src/components/demos/grid/LCSHero.tsx`
- `site/src/components/demos/grid/lcs-demo.css`
- `site/tests/browser/body-demo-standardization.spec.ts`

## 当前验证证据

以下门禁已在当前 A/01、完全背包与 B/LCS 样机通过：

- `pnpm test:unit`：11 个测试文件、45 项测试全部通过
- `pnpm test`：233 项 Node 合同测试全部通过
- `pnpm lint`：零 warning
- `pnpm build`：两区产物与 96 个区域 HTML 正常生成
- 资源预算：243 个文件，Cloudflare 5,691,431 bytes、EdgeOne 5,691,429 bytes，最大单文件 732,959 bytes，门禁通过
- 当前 Cloudflare 预算余量为 608,569 bytes；保持 6.30 MB 门禁不变，新增家族资产仍须在现有余量内完成。
- 家族路由插画已完成桌面与 390×844 移动端实页核对，Hero 与课程旅程图完整、清晰，控制台无 warning/error。
- B–G 家族插画专项 Chromium：9 项全部通过，覆盖类别 Hero、28 张课程图版、深浅主题、中间宽度、reduced-motion 与真实 Demo 状态变化。
- 正文标准专项 Chromium：8 项全部通过；新增 B/LCS 独立静态 Hero、字符交互和连续窄宽门禁
- in-app browser 实测：640×900 下物品卡 224px 两列、DP 表右侧缓冲 16px、播放与倍速同排相隔 12px；390×844 下物品卡 224px，播放/进度/倍速三排，2× 与下一步交互正常；两端无页面横向溢出
- 完全背包 1280px 实页使用独立 `knapsack-complete-instrument-v1` 资产，容量改为 18 并前进一步后 Hero 地址不变；控制台无 warning/error
- 连续断点实测：A/01 覆盖 320、360、390、430、480、540、600、640、720、740、768px；完全背包再覆盖 320、360、390、540、720、740、768px。页面、Demo、参数区、Hero 与控制轨均为零溢出，DP 表保持 16px 右侧缓冲。
- B/LCS 覆盖 320、360、390、430、480、540、600、640、720、740、768px；字符卡宽度不超过 132px，Hero、数据编辑器、DP 表和播放轨无页面级溢出。桌面与 390px 实页已人工核对，干净直达页面的控制台为零 warning/error。

完整 `pnpm verify` 尚未执行；B/LCS 与其余家族代表课完成复核前不得推广或勾选最终门禁。

## 第二轮状态与新拍板材料

旧代表课程截图只证明共享壳层落地，不再作为视觉通过材料。用户指出它们在材质、透视、画面密度和设计稿还原度上明显不足。

用户已认可 A/01 当前方向，现以 B/LCS 验证同一策略能否形成独立的线性 DP 家族语言：

- 不再用手写 SVG/CSS 近似不可参数化的高精度材质。
- 高保真透明资产只承担静态美化，不烘焙也不映射动态文字、数字、控件或播放帧。
- 所有动态数据与交互都留在独立编辑区和 DP 表中；Hero 不再承担算法状态语义。
- 每个代表课程继续制作独特的高保真雕塑；B/LCS 通过复核后再推进下一家族，并最终重建第二轮评审页。

第一轮若需要向用户复述，应明确为：纵向仪表脊、公共交互整体确认、增强演绎档；它是方向评审，不是本轮代表课成品验收。

## 恢复步骤

1. 从 `site/` 运行 `pnpm build`，再以
   `node scripts/preview.mjs --host 127.0.0.1 --port 4173 --strictPort`
   启动本地预览。
2. 使用 in-app browser 打开 `/part/b/lcs`，定位“看它一格一格长出来”，核对静态 Hero、字符编辑器、DP 表和播放轨的桌面与移动端实页。
3. 等待用户判断 B/LCS 是否保持设计稿方向与独立家族语言；不要让用户在旧第二轮弹窗中保存“确认推广”。
4. 若 B/LCS 仍不通过，继续只改该样例；若通过，再为其余代表课程制作家族化高保真雕塑并重建第二轮评审材料。
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
