# DP大师课程目录深化设计

## 目标

把课程身份、路由、正文懒加载、家族游戏懒加载和前后导航集中到一个课程目录 Module；正文中的 `ExampleCard` / `Exercise` 继续作为题目语料唯一来源，由 TypeScript AST 生成器派生公开题目索引。

同时完成项目级低成本治理：产品统一显示为“DP大师”、补 `AGENTS.md`、删除未使用依赖、消除 Fast Refresh 警告、声明 Node/npm 工具链、建立 CI 和资产预算。

## 约束

- 在当前 `main` 工作区实施，不创建 branch 或 worktree。
- 不提交、不推送，除非用户另行要求。
- 产品与文档显示名改为“DP大师”。
- 保留兼容标识：目录 `DpMaster`、GitHub 仓库 URL、Cloudflare/EdgeOne 项目名 `dpmaster`、域名 `dp.betaoi.cc`。
- 不新增运行时依赖；内容生成器使用现有 TypeScript 编译器解析 JSX AST。
- 正文保留现有自定义讲解、代码和练习提示，不机械搬迁到中央数据表。

## Architecture

`site/src/data/catalog.ts` 成为课程目录 Module。每个家族条目拥有显示元数据、懒加载游戏和有序课程列表；每个课程条目拥有 slug、状态和懒加载正文。`TypePage`、`PartPage`、导航、反馈页面标签和题目索引只跨该 Interface。

`site/scripts/generate-problems.mjs` 解析课程目录中的正文 import，再解析对应 TSX 中的 `ExampleCard` / `Exercise` 字面量属性，生成 `site/src/data/problems.ts`。生成结果按课程目录顺序和正文出现顺序稳定排列；`--check` 检测漂移，`--write` 更新文件，`--json` 为测试提供不写盘的报告。

## Verification

- Node 内置测试运行内容生成、目录合同和资产预算测试。
- 内容测试固定 177 个槽位，并验证 `c/tree` 中 P1880 是例题、P1436 是练习。
- lint 以零 warning 为 gate。
- build 后检查总资产与单文件预算。
- GitHub Actions 使用 Node 24、npm 11、`npm ci` 和 `npm run verify`。

## Naming

用户可见的站点标题、侧栏品牌、反馈文案、README 和 OKF 文档统一为“DP大师”。兼容标识保持不变，并在项目 `AGENTS.md` 中明确，防止后续维护误改部署链路。

