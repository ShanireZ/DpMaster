import { existsSync, readdirSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ASSET_BUDGET = Object.freeze({
  total: 4_700_000,
  file: 760_000,
  css: 80_000,
})

function filesUnder(root) {
  const files = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name)
    if (entry.isDirectory()) files.push(...filesUnder(path))
    else if (entry.isFile()) files.push(path)
  }
  return files
}

function format(bytes) {
  return new Intl.NumberFormat('en-US').format(bytes)
}

export function checkAssets(root, budget = ASSET_BUDGET) {
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    return { ok: false, total: 0, files: [], errors: [`Missing build directory: ${root}`] }
  }
  const files = filesUnder(root).map((path) => ({ path, bytes: statSync(path).size }))
  const total = files.reduce((sum, file) => sum + file.bytes, 0)
  const errors = []
  if (total > budget.total) errors.push(`Total output ${format(total)} exceeds ${format(budget.total)} bytes`)
  for (const file of files) {
    const limit = extname(file.path).toLowerCase() === '.css' ? budget.css : budget.file
    if (file.bytes > limit) {
      errors.push(`${file.path} is oversized: ${format(file.bytes)} > ${format(limit)} bytes`)
    }
  }
  return { ok: errors.length === 0, total, files, errors }
}

function main() {
  const root = resolve(process.argv[2] ?? 'dist')
  const result = checkAssets(root)
  if (!result.ok) {
    for (const error of result.errors) console.error(`[assets] ${error}`)
    process.exitCode = 1
    return
  }
  const largest = result.files.reduce((best, file) => (file.bytes > (best?.bytes ?? -1) ? file : best), null)
  console.log(
    `[assets] ${result.files.length} files, ${format(result.total)} bytes total, largest ${largest ? `${format(largest.bytes)} bytes` : 'n/a'}`,
  )
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main()

