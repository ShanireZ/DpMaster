---
type: Design Specification
title: DP大师反馈、播放、小游戏运行时与可发现性深化设计
description: Design for feedback hardening, playback consolidation, deferred games, SEO, and accessibility.
tags: [engineering, feedback, playback, games, seo, accessibility]
timestamp: 2026-07-10T10:00:00+08:00
source_paths:
  - site/functions/_feedback-core.js
  - site/src/components/feedback/
  - site/src/components/dp-engine/
  - site/src/components/games/
  - site/src/data/catalog.ts
  - site/src/pages/PartPage.tsx
  - site/src/app/App.tsx
---

# DP大师反馈、播放、小游戏运行时与可发现性深化设计

## 1. 目标与范围

本轮按优先级深化四个领域：

1. P0：强化反馈入口，使输入、限流、日志、Webhook 状态与用户提示可验证。
2. P1：深化可视化播放 Module，统一状态、控制语义、键盘操作与空轨迹安全性。
3. P1：建立小游戏运行时，集中音频、随机源与战绩，并让游戏真正接近视口时才加载。
4. P1：补齐动态 SEO、站点地图与跨页面无障碍基础设施。

继续保留静态 React/Vite 架构，不引入账号、数据库、持久队列、新部署服务、branch 或 worktree。目录、课程和游戏身份仍由 `site/src/data/catalog.ts` 统一拥有。

## 2. 设计原则

- 每个领域建立一个较深的 Module，而不是抽取若干浅 helper。
- 公共 Interface 只暴露调用者需要的稳定语义；运行时差异留在 Adapter。
- 失败状态必须可区分、可记录、可测试，不用统一的布尔值抹平原因。
- 课程目录、游戏 lazy import 与 SEO 路由不得形成平行 registry。
- 优先使用 Node 24 原生能力和现有 React/Vite 工具链，不增加重型依赖。
- 所有新合同先写失败测试，再实现最小通过路径。

## 3. P0 反馈入口

### 3.1 当前问题

当前反馈核心只检查描述长度和总体 JSON 大小；反馈类型、字段边界、来源与频率缺少统一合同。Webhook 未配置、网络异常、非 2xx 或业务错误都被折叠为 `{ok:true}`，后台只能通过非结构化日志判断实际状态。浏览器弹窗具备基本对话框语义，但没有完整焦点锁定、焦点恢复、错误播报和分组控件语义。

### 3.2 目标数据流

```text
FeedbackWidget
  -> runtime Adapter (Worker / Pages / EdgeOne)
  -> request contract
  -> source limiter
  -> structured log
  -> best-effort webhook
  -> delivery receipt
```

`functions/_feedback-core.js` 继续作为三家运行时的单一核心。Worker、Pages Function 与 EdgeOne 只翻译环境、请求头和静态资源行为，不复制校验或响应规则。

### 3.3 请求合同

- 只接受 `POST` 与 `application/json`。
- `kind` 必须属于既有五种反馈类型。
- `description` 去空白后长度为 4 到 2000。
- `steps` 最多 1000，`contact` 最多 120，`page/path/url/viewport/ua/ts` 分别设置明确上限。
- 总请求体设置硬上限，超出返回 413；JSON 错误返回 400；字段错误返回 422。
- 浏览器携带 `Origin` 时必须与请求 host 同源；缺失 `Origin` 的非浏览器调用仍允许，便于部署探测和测试。
- 所有错误响应采用稳定的 `{ok:false,error,message}` 结构。

### 3.4 限流

用户确认的规则为：同一来源在滚动 30 分钟内最多 10 条反馈，第 11 条返回 429，并提示稍后再试。

来源优先从部署平台传入的客户端 IP 头获取；无可信 IP 时退化到匿名来源桶。核心提供可注入的 `now` 和 `sourceKey` Seam，测试不依赖真实时间或网络。

由于项目不引入 KV、数据库或 Durable Object，内置限流只能保证单个边缘实例内的轻量保护。部署文档必须明确：需要跨实例强一致限流时，应在 Cloudflare/EdgeOne 的 WAF 或平台限流规则中重复配置 30 分钟 10 条。本地限流不应被描述成全局安全边界。

限流状态使用有上限的内存 Map，并在请求时清理过期桶，避免无限增长。响应包含 `Retry-After`。

### 3.5 日志与 Webhook 语义

每条合法反馈先生成 `requestId`，再写结构化日志。只要日志调用成功，就视为已经收到反馈；这是用户确认的产品语义。

Webhook 是尽力转发：

- 成功：`{ok:true,status:'logged',forwarded:true,requestId}`。
- 未配置、网络异常、非 2xx 或平台业务错误：记录诊断日志，返回 `{ok:true,status:'logged',forwarded:false,requestId}`。
- Webhook 失败不改变浏览器的成功提示。

日志必须包含 requestId、反馈类型、页面、清洗后的正文、Webhook 状态和失败分类；不得输出 Webhook URL、签名密钥或其他环境变量。

### 3.6 浏览器体验与无障碍

- 429 显示“提交太频繁，请稍后再试”。
- 其他可恢复失败继续提供“复制反馈内容”。
- 成功态统一显示“已收到”，不暴露 Webhook 细节。
- 打开弹窗时记录触发按钮，关闭后恢复焦点。
- Tab/Shift+Tab 被限制在对话框内；Escape 关闭；打开时锁定背景滚动。
- 类型选择使用 `fieldset/legend` 与 `aria-pressed` 或单选语义。
- 错误、发送状态和成功状态通过 `aria-live` 播报。

## 4. P1 可视化播放 Module

### 4.1 Module 结构

```text
site/src/components/dp-engine/playback/
  state.ts
  useStepPlayer.ts
  PlaybackControls.tsx
  playback.css
```

`state.ts` 是纯状态 Implementation，拥有索引钳制、前后步、重置、结尾重播、速度合法化和空轨迹规则。`useStepPlayer` 只处理 React 状态与计时。`PlaybackControls` 把播放器 Interface 适配为可访问控件。

### 4.2 状态合同

- `count=0` 时 `index=0`、不能播放、不能前后步，不产生 `-1`。
- 播放到最后一帧自动暂停。
- 在最后一帧点击播放时从第 0 帧重新开始。
- 帧数变化时暂停并把索引钳制到合法范围。
- 速度限定为已支持档位，非法输入回退到 1 倍速。
- 所有定时器在暂停、卸载和输入变化时可靠清理。

### 4.3 控制与键盘

网格、树、棋盘和换根共享相同语义：重置、上一步、播放/暂停、下一步、进度、速度。提供两种视觉 Adapter：

- `full`：完整按钮、滑杆、步骤文本与速度选择。
- `compact`：更紧凑的图标布局，但不删除功能。

键盘规则：

- Space：播放或暂停。
- ArrowLeft / ArrowRight：前后一步。
- Home：重置。
- 当输入框、文本域、选择框或其他可编辑元素拥有焦点时不拦截按键。

控件通过 `aria-keyshortcuts` 公开快捷键，当前步骤和播放状态使用 `aria-live` 播报。

### 4.4 迁移范围

首批迁移所有当前使用 `useStepPlayer` 的载体：`DPViz`、树形 DP、棋盘状压、换根两遍演示。具有不同状态语义的回溯或矩阵动画保留局部 Adapter；只有满足同一帧合同后才接入，不为了统一而扭曲其状态模型。

## 5. P1 小游戏运行时与懒加载

### 5.1 Module 结构

```text
site/src/components/games/runtime/
  audio.ts
  random.ts
  round.ts
  DeferredGame.tsx
```

Module 集中七个小游戏共同拥有的能力，具体题目规则、难度参数、局面状态和 UI 仍留在各游戏中。

### 5.2 音频

- 浏览器首次用户交互前不创建 `AudioContext`。
- 全站游戏共享一个上下文，统一 `playTone` Interface。
- 静音状态由游戏传入；运行时处理浏览器兼容、上下文恢复和异常降级。
- 游戏删除各自的 `ac` 与 `blip` Implementation。

### 5.3 随机源

游戏规则依赖 `RandomSource` 而不是直接调用 `Math.random`。生产实现使用浏览器随机源；测试实现使用固定 seed。运行时提供有明确上下界的整数生成 Interface，各游戏继续拥有自己的难度分布。

### 5.4 回合战绩

统一回合状态拥有：已玩次数、命中次数、本局是否已计数、记录结果和开始新局。重复点击揭晓不会重复统计；换题、换难度或重新开局后才允许下一次记录。

### 5.5 真正懒加载

当前 `catalog.ts` 的 React lazy import 只有在组件尚未渲染时才不会执行，因此 `PartPage` 不再直接挂载游戏组件。`DeferredGame` 使用 `IntersectionObserver`：

- 游戏区域进入视口前约 400px 时首次挂载 lazy 游戏。
- 挂载后保持已加载状态，不因滚出视口卸载。
- 不提供手动加载按钮。
- 未接近时展示轻量占位内容并标记 `aria-busy`。
- 不支持 `IntersectionObserver` 的浏览器自动立即加载，避免功能消失。

游戏身份和动态 import 继续只存在于 `catalog.ts`。

## 6. P1 SEO 与无障碍

### 6.1 Page Meta Module

`page-meta` Module 根据路由与课程目录生成：

- `title`
- `description`
- `canonical`
- Open Graph title、description、URL、type 与 site name

37 个课程使用固定标题格式：`课程名 · 家族名 · DP大师`。家族页、首页、方法论、题目索引和关于页有各自的稳定元信息。生产基址固定为 `https://dp.betaoi.cc`，兼容部署标识不改名。

App 内只挂载一个路由 Meta Adapter；页面不手写重复标签。`index.html` 提供首页默认 meta、theme color 和 WebSite JSON-LD，保证脚本执行前也有合理首页信息。

### 6.2 Sitemap 与 Robots

构建脚本从 `catalog.ts` 生成 `public/sitemap.xml` 与 `public/robots.txt`。站点地图包含：

- 首页；
- 7 个家族页；
- 37 个已完成课程页；
- 方法论、题目索引和关于页。

生成检查验证 URL 唯一、生产域名一致、37 个课程齐全和 XML 基本合法。`check:seo` 纳入 `npm run verify`。

### 6.3 全站无障碍基础设施

- Shell 顶部提供“跳到主要内容”链接，目标为 `main#main-content`。
- 路由变化时更新文档标题，并用隐藏 `aria-live` 区域播报页面名称。
- 当前侧栏与面包屑链接设置 `aria-current`。
- 全站提供清晰 `:focus-visible` 样式。
- `prefers-reduced-motion: reduce` 时关闭非必要动画、过渡和平滑滚动。
- 反馈弹窗、播放控件和游戏占位状态遵守前述焦点与播报合同。

## 7. 测试与验收

### 7.1 自动测试

- 反馈：请求 schema、字段边界、Origin、10/11 次限流、30 分钟窗口、Retry-After、日志成功、Webhook 四类失败和回执。
- 播放：空轨迹、钳制、步进、重置、结尾重播、速度、计时清理和键盘过滤。
- 游戏运行时：固定 seed、整数边界、回合只计一次、重开、音频惰性创建、IntersectionObserver 触发一次。
- SEO：所有路由元信息、37 个课程标题、canonical 唯一、Open Graph、sitemap 与 robots。
- 架构守卫：运行时 Adapter 不复制核心规则；游戏不再声明 AudioContext、私有战绩状态或直接 `Math.random`；页面不建立平行 SEO registry。

### 7.2 浏览器验收

- 反馈：键盘打开、焦点循环、Escape、成功、429 和复制降级。
- 播放：四种载体的 full/compact 控件、快捷键、进度和速度。
- 游戏：家族页初始不加载游戏 chunk；滚动接近后加载且可完成一局。
- SEO：页面标题和 head 标签随路由变化。
- 无障碍：跳转链接、当前导航、可见焦点、减弱动画和零相关控制台错误。

### 7.3 完整门禁

从 `site/` 执行：

```powershell
npm run verify
npm audit --audit-level=low
```

并检查 `git diff --check`、品牌合同、单一 `main` branch 和单一 worktree。

## 8. 分阶段交付

1. Feedback P0：请求合同、限流、日志回执、弹窗无障碍、测试和部署文档。
2. Playback P1：纯状态、Hook、控制 Adapter、四类载体迁移和测试。
3. Game runtime P1：音频、随机、战绩、七游戏迁移、DeferredGame 和懒加载验证。
4. SEO/A11y P1：Page Meta、生成文件、Shell 语义、全站样式和浏览器验收。

每阶段先完成自己的测试和构建，再进入下一阶段；任何阶段都不以重写其余领域为前提。

## 9. 非目标与剩余风险

- 不增加反馈数据库、消息队列、账号系统或管理后台。
- 不承诺内存限流跨边缘实例强一致；平台级限流属于部署增强。
- 不把所有特殊动画强行迁入统一播放器。
- 不统一七个游戏的题目规则或难度配置。
- 不做 SSR 或预渲染迁移；SEO 依赖稳定 head、站点地图和现代爬虫执行 SPA。
- 不在本轮进行全站逐色值 WCAG 对比度重设计；发现的明确对比度问题作为单独缺陷处理。
