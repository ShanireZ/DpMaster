# 部署指南 · DpMaster

本站是纯静态 SPA（Vite + React + react-router，`BrowserRouter` history 模式），
同时部署到两处，互为主备、各扬所长：

| 目标 | 免费 | 备案 | 大陆访问 | 部署后地址 |
|---|---|---|---|---|
| **Cloudflare Workers**（静态资源） | 不限带宽 | 免 | 一般（走境外节点） | `https://dpmaster.<你的子域>.workers.dev` |
| **腾讯云 EdgeOne Pages** | 免费 | 官方子域名免备案 | 好（腾讯国内节点） | `https://dpmaster.edgeone.app` |

---

## 一行命令部署（日常）

```bash
npm run deploy
```

它等于：**构建一次 → 发 Cloudflare → 发 EdgeOne**，即
`npm run build`（含生成 `dist/404.html`）→ `wrangler deploy` → `edgeone pages deploy ./dist -n dpmaster -e production`。

也可单独发某一边：`npm run deploy:cf` / `npm run deploy:eo`。

> 项目名两边都叫 `dpmaster`（决定子域名前缀）。想改名：同时改 `wrangler.jsonc` 的 `name`
> 和 `package.json` 里 `deploy:eo` 的 `-n` 值。

---

## 首次一次性设置

> 推荐用「登录」方式：授权在**你自己的浏览器**里完成，密钥存在本机、不经过任何人，
> 之后 `npm run deploy` 全自动。**不需要把任何 token 交给别人，也不要提交进仓库。**

### Cloudflare

**方式 A · 登录（推荐）**
```bash
npx wrangler login
```
浏览器点授权即可。首次部署会问是否启用 `workers.dev` 子域，确认即可。

**方式 B · API Token（换机 / CI 用）**
1. Cloudflare 控制台 → 右上头像 → **My Profile → API Tokens → Create Token**
2. 选 **“Edit Cloudflare Workers”** 模板 → 按引导创建 → 复制 Token
3. 设为环境变量（勿写进仓库）：
   - PowerShell：`$env:CLOUDFLARE_API_TOKEN = "你的Token"`
   - 需要时另设 `CLOUDFLARE_ACCOUNT_ID`（在 **Workers & Pages** 页面右栏可见）
4. `npm run deploy:cf`

### EdgeOne（腾讯云）

**方式 A · 登录（推荐）**
```bash
npx edgeone login
```
选 **China**，弹出的浏览器里用腾讯云账号登录。首次需要一个名为 `dpmaster` 的
Pages 项目（与脚本 `-n dpmaster` 一致）——若控制台还没有，deploy 会引导创建，
或先去 EdgeOne Pages 控制台手动建一个同名项目。

**方式 B · API Token（CI 用）**
1. EdgeOne Pages（Makers）控制台 → **API Token** 标签 → **Create API Token**（填描述、有效期）→ 复制
2. 部署时带上 Token：
   ```bash
   npx edgeone pages deploy ./dist -n dpmaster -t 你的Token -e production
   ```

---

## 两边 SPA 深链回退（一处重要差异）

本站用 history 路由，`/part/a/knapsack-01` 这类深链**直接访问或刷新**时，服务器上
没有对应文件，需要托管把未命中路径回退到 SPA 入口：

- **Cloudflare** — `wrangler.jsonc` 里 `assets.not_found_handling = "single-page-application"`，
  未命中即返回 `index.html` + **HTTP 200**（干净、SEO 友好）。
- **EdgeOne** — 平台**不支持** `edgeone.json` 的 rewrites 做 SPA 回退，改由构建时生成的
  `dist/404.html`（复制自 `index.html`）兜底：内容是 SPA 入口，浏览器加载后 react-router
  接管、页面正常，但 **HTTP 状态码是 404**。功能无碍；若日后特别在意大陆侧的状态码/SEO，
  可再加一个 EdgeOne Function 做 200 兜底（可选，需要时再加）。

`dist/404.html` 由 `scripts/postbuild.mjs` 在每次 `npm run build` 后自动生成，对
Cloudflare 无副作用（CF 优先走 `not_found_handling`）。

---

## 自定义域名（以后再说）

- **Cloudflare**：加自定义域走 CF DNS，**免备案**。
- **EdgeOne**：自定义域名 + 国内加速**需 ICP 备案**（腾讯云备案免费但走 2–3 周流程）。
  备案前先用 `dpmaster.edgeone.app` 子域名，大陆已可直连。

---

## 备注

- `dist/` 已在 `.gitignore`，构建产物不入仓库；每次 `npm run deploy` 本地重新构建后推送。
- `wrangler` / `edgeone` 已在 `devDependencies`，克隆后 `npm install` 即可用，无需全局安装。
- 这两个 CLI 拉入了一批带告警的传递依赖，仅本地部署时运行、**不进生产产物**，不影响站点安全。
