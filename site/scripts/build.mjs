// 单一构建目标：Cloudflare Worker 静态资源（dist/）。
// 先出客户端产物，再出 SSR 入口，最后预渲染全部路由与真实 404，并清掉 SSR 中间产物。

import { existsSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { build } from 'vite'

const outDir = resolve('dist')
const serverOut = resolve('.prerender')

function runPrerender(serverEntry) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(
      process.execPath,
      [
        resolve('scripts/prerender.mjs'),
        '--out-dir',
        outDir,
        '--server-entry',
        serverEntry,
      ],
      {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' },
      },
    )
    child.on('error', rejectPromise)
    child.on('exit', (code) => {
      if (code === 0) resolvePromise()
      else rejectPromise(new Error(`Prerender exited with code ${code}`))
    })
  })
}

process.env.NODE_ENV = 'production'
const revision = spawnSync('git', ['rev-parse', '--short=12', 'HEAD'], {
  encoding: 'utf8',
})
process.env.VITE_BUILD_ID = revision.status === 0 ? revision.stdout.trim() : 'unknown'
rmSync(outDir, { recursive: true, force: true })

await build({
  mode: 'production',
  build: {
    outDir,
    emptyOutDir: true,
  },
})

await build({
  mode: 'production',
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: serverOut,
    emptyOutDir: true,
    copyPublicDir: false,
  },
})

const serverEntry = join(serverOut, 'entry-server.js')
if (!existsSync(serverEntry)) {
  throw new Error(`Missing SSR entry: ${serverEntry}`)
}
await runPrerender(serverEntry)
rmSync(serverOut, { recursive: true, force: true })
