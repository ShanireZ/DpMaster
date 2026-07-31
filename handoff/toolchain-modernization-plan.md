# DP大师工程基线与文档治理计划

> Task：A  
> 状态：已完成  
> Git：全部门禁通过后创建一个本地 commit；不 push、不部署

## 已拍板合同

- Node 24 LTS 最新成熟补丁，pnpm 11 最新成熟版本，TypeScript 7。
- 直接依赖使用完成 24 小时隔离的最新稳定主线下限与 `^` 范围。
- pnpm 11 设置只写入 `site/pnpm-workspace.yaml`；CI 使用 frozen lockfile。
- 禁止废弃 API、旧模块、旧浏览器兼容层、弃用命令和兼容选择器。
- GitHub Actions 只运行 CI；生产由本地 `pnpm release` 完整验证、构建一次并双区发布。
- `docs/` 只保存 OKF v0.2 当前长期事实；任务计划与评审勾选只在 `handoff/`。
- 版本漂移每周只读巡检并维护单一滚动 Issue，不自动改代码或创建升级 PR。

## 实施清单

- [x] 使用 `.node-version`、`packageManager`、`devEngines` 固定 Node 24 / pnpm 11。
- [x] 删除 npm lockfile，生成通过供应链策略的 `pnpm-lock.yaml`。
- [x] 启用 24 小时隔离、严格 Node 引擎、依赖构建白名单和依赖状态门禁。
- [x] 升级 TypeScript 7、Oxlint 类型感知、应用与测试依赖。
- [x] 清除 `kd__/fbug__` 与 CommonJS/废弃 API 等旧兼容表面。
- [x] 建立 `pnpm verify`、`pnpm release`、单区部署和版本巡检命令。
- [x] GitHub CI 使用 pnpm 11、Node 24、Chromium 全量及 Firefox/WebKit 冒烟。
- [x] 建立每周滚动 Issue 版本巡检，不配置生产部署。
- [x] 将 AGENTS、README、部署说明同步为当前合同。
- [x] 将 `docs/` 迁移至 OKF v0.2，删除日志、漂移记录和已完成历史计划。
- [x] 增加工具链、OKF、浏览器和旧兼容回归测试。
- [x] 运行完整 `pnpm verify`、文档链接检查、`git diff --check`。
- [x] 总结 Task A 并创建唯一聚焦 commit。
