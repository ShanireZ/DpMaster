# DP大师正文 Demo 改造会话交接（2026-08-01）

> 交接目的：2026-08-02 继续 Task B。  
> 当前分支：`main`。  
> 远端停点：`origin/main = beeb684`。  
> 本地未推送提交：`a7beef6 fix: keep route metadata current before commit`。  
> 禁止事项：不 push、不部署、不执行 `pnpm release`。

## 明日先做

1. 先确认工作区仍然干净：`git status -sb`。
2. 由用户 push 当前本地提交 `a7beef6`，等待新一轮 GitHub Actions 完成。
3. 检查新的 `DP大师 CI` 运行；只有 CI 通过后才继续视觉工作。若失败，读取该轮实际失败步骤与日志，不沿用旧轮猜测。
4. 打开 `http://127.0.0.1:4173/part/b/lcs`，定位“看它一格一格长出来，再回溯出答案”，请用户明确判断 B/LCS 是否保持设计稿方向与独立线性 DP 家族语言。
5. B/LCS 未通过时只改该样例；明确通过后，才开始下一个家族的独立高保真静态雕塑并重建第二轮评审材料。

## Git 与 CI 停点

- `beeb684 perf: reclaim family art asset budget` 已由用户 push，是当前远端 `main`。
- 对应 [CI #78](https://github.com/ShanireZ/DpMaster/actions/runs/30704281060) 失败：checkout、pnpm、Node、依赖和 Chromium/Firefox/WebKit 安装均成功，`pnpm verify` 在最前段 `check:seo` 失败。
- 根因已本地复现：`beeb684` 修改 C–G 路由视觉源文件后，以下 Git 日期派生产物仍停留在提交前状态：
  - `site/public/sitemap.xml`
  - `site/public/llms.txt`
  - `site/public/route-summaries.json`
  - `site/src/data/routeLastModified.ts`
- `a7beef6` 已刷新这四份产物，并修复 `site/scripts/last-modified.mjs`：提交前生成 SEO 时，尚未提交的路由依赖会使用本地日期，不再要求“先提交路由修改、再补一轮日期提交”。
- `site/scripts/seo-contract.test.mjs` 已增加对应工具链合同。
- 用户自己的 PowerShell 中 `gh auth status` 正常。Codex 进程无法读取 Windows Keyring，因此 `gh run view --log-failed` 可能返回 403；这不是用户凭据失效。公开运行状态仍可用 `gh run list` 或 Actions 页面检查。

## 当前产品与评审状态

- 第一轮只确认了方向：纵向仪表脊、公共交互整体确认、增强演绎档；不是代表课程成品验收。
- 旧第二轮代表课程评审已明确未通过，原因是材质、空间关系与主构图密度离设计稿太远；旧评审页不能作为通过证据。
- A/01 的“静态高保真 Hero 与数据完全解耦”方向已由用户确认。
- 完全背包已有独立静态 Hero，表达同类物品可重复取用，不复用 01 背包资产。
- B/LCS 已接入独立 `960×450` 透明 AVIF：Hero 只负责装饰；字符、匹配、DP 表和播放状态全部留在数据区。
- B/LCS 当前仍是第二个家族样例的待评审对象。未取得用户明确判断前，不推广至其余家族或全部 37 课。
- 本次会话已在实页启动 B/LCS 播放，桌面 Hero、编辑器、DP 表和控制轨正常；本地预览标签停在 Hero/编辑器区域。4173 端口在交接时已有预览服务，但明日恢复时应重新确认，不假设进程仍存在。

## 当前验证证据

- `pnpm check:seo`：在提交 `a7beef6` 后再次运行，通过 47 条公开路由一致性检查。
- SEO/工具链专项：12/12 通过。
- `pnpm test`：233/233 Node 合同测试通过。
- `pnpm test:unit`：11 个文件、45/45 通过。
- `pnpm lint`：零 warning。
- `pnpm build`：Cloudflare/EdgeOne 双区构建及 96 个区域 HTML 通过。
- `pnpm check:analytics`：96 个 EdgeOne 页面各一份静态 beacon，96 个 Cloudflare 页面不含静态 beacon。
- `pnpm check:assets`：243 个文件；Cloudflare `5,691,431` bytes，EdgeOne `5,691,429` bytes，最大单文件 `732,959` bytes；6.30 MB 门禁余量 `608,569` bytes。
- 正文标准 Chromium 专项：8/8 通过，覆盖 14 门代表课、A/01、完全背包、B/LCS 窄宽、共享 DP 表、插头 DP、主题与 reduced-motion。
- B–G 家族插画专项：9/9 通过，覆盖类别 Hero、28 张课程图版、主题、中间宽度和真实 Demo 状态变化。
- 最近一次 Chromium 全量：42/42 通过。
- 完整 `pnpm verify` 本轮运行到浏览器阶段前的所有门禁均通过；浏览器启动因已有 4173 严格预览占用而停止，不是断言失败。随后复用现有预览运行正文标准专项，8/8 通过。

## 关键文件

- 总计划：[`body-demo-standardization-plan.md`](body-demo-standardization-plan.md)
- 长期任务交接：[`body-demo-standardization-handoff.md`](body-demo-standardization-handoff.md)
- 逐课审计：[`../docs/concepts/body-demo-audit.md`](../docs/concepts/body-demo-audit.md)
- B/LCS Hero 资产：`site/src/assets/demo-art/lcs-instrument-v1.avif`
- B/LCS Hero：`site/src/components/demos/grid/LCSHero.tsx`
- B/LCS 响应式样式：`site/src/components/demos/grid/lcs-demo.css`
- 正文专项浏览器合同：`site/tests/browser/body-demo-standardization.spec.ts`
- 路由日期生成器：`site/scripts/last-modified.mjs`
- CI 工作流：`.github/workflows/ci.yml`

## 明日恢复命令

所有包管理命令从 `site/` 执行：

```powershell
cd D:\Workspace\DpMaster
git status -sb
git log -3 --oneline
gh run list --repo ShanireZ/DpMaster --workflow ci.yml --limit 3

cd site
pnpm check:seo
pnpm build
node scripts/preview.mjs --host 127.0.0.1 --port 4173 --strictPort
```

若 4173 已占用，先确认占用者；不要停止用户已有服务。浏览器回归可复用现有生产预览并使用不管理 `webServer` 的临时 Playwright 配置，完成后删除临时配置。

## 不要做

- 不要执行 `pnpm release`、`pnpm deploy:cf` 或 `pnpm deploy:eo`。
- 不要把 GitHub Actions 改成部署通道。
- 不要因为 Codex 内的 `gh auth status` 读不到 Keyring 而要求用户再次登录。
- 不要把旧第二轮截图或旧评审弹窗当作已经通过。
- 不要在 B/LCS 明确通过前推广到全部 37 门课程。
- 不要把动态字符、数字、匹配状态或播放帧重新烘焙进 Hero。
- 不要用手写 SVG/CSS 假装高保真材质；Hero 延续“独立静态透明资产，数据留在仪器区”的策略。
- 不要通过提高 6.30 MB 阈值掩盖资源增长。
- 不要清理、覆盖或停止不属于当前任务的工作区改动与本地服务。
