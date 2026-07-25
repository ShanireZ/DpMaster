import { existsSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { build } from 'vite'

const regions = [
  { name: 'international', outDir: resolve('dist/cloudflare') },
  { name: 'china', outDir: resolve('dist/edgeone') },
]

function runPrerender(region, outDir, serverEntry) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(
      process.execPath,
      [
        resolve('scripts/prerender.mjs'),
        '--region',
        region,
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
rmSync(resolve('dist'), { recursive: true, force: true })

for (const region of regions) {
  process.env.DP_SITE_REGION = region.name
  await build({
    mode: 'production',
    build: {
      outDir: region.outDir,
      emptyOutDir: true,
    },
  })
  const serverOut = resolve('.prerender', region.name)
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
  await runPrerender(region.name, region.outDir, serverEntry)
  rmSync(serverOut, { recursive: true, force: true })
}

rmSync(resolve('.prerender'), { recursive: true, force: true })
