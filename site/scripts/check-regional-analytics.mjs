import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PRERENDER_PATHS } from '../src/lib/publicRoutes.ts'

const beacon =
  '<!-- Cloudflare Web Analytics --><script type=\'module\' src=\'https://static.cloudflareinsights.com/beacon.min.js\' data-cf-beacon=\'{"token": "c113fb69d7e84d38a645c5160f6f1bda"}\'></script><!-- End Cloudflare Web Analytics -->'

function htmlFilesUnder(root) {
  const files = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name)
    if (entry.isDirectory()) files.push(...htmlFilesUnder(path))
    else if (entry.isFile() && extname(entry.name) === '.html') files.push(path)
  }
  return files
}

function countOccurrences(content, value) {
  return content.split(value).length - 1
}

export function checkRegionalAnalytics({
  cloudflareDir = resolve('dist/cloudflare'),
  edgeOneDir = resolve('dist/edgeone'),
} = {}) {
  const cloudflareHtml = htmlFilesUnder(cloudflareDir)
  const edgeOneHtml = htmlFilesUnder(edgeOneDir)
  const expectedHtmlFiles = 1 + (PRERENDER_PATHS.length - 1) * 2 + 1
  const errors = []

  if (cloudflareHtml.length !== expectedHtmlFiles) {
    errors.push(
      `Cloudflare HTML count ${cloudflareHtml.length} does not match ${expectedHtmlFiles}`,
    )
  }
  if (edgeOneHtml.length !== expectedHtmlFiles) {
    errors.push(
      `EdgeOne HTML count ${edgeOneHtml.length} does not match ${expectedHtmlFiles}`,
    )
  }

  for (const path of cloudflareHtml) {
    const html = readFileSync(path, 'utf8')
    if (html.includes('<!-- Cloudflare Web Analytics -->')) {
      errors.push(`Static Web Analytics leaked into Cloudflare HTML: ${path}`)
    }
  }

  for (const path of edgeOneHtml) {
    const html = readFileSync(path, 'utf8')
    if (countOccurrences(html, beacon) !== 1) {
      errors.push(`EdgeOne HTML must contain the exact beacon once: ${path}`)
    }
  }

  return {
    ok: errors.length === 0,
    cloudflareHtml: cloudflareHtml.length,
    edgeOneHtml: edgeOneHtml.length,
    errors,
  }
}

function main() {
  const result = checkRegionalAnalytics()
  if (!result.ok) {
    for (const error of result.errors) console.error(`[analytics] ${error}`)
    process.exitCode = 1
    return
  }
  console.log(
    `[analytics] ${result.edgeOneHtml} EdgeOne pages contain one static beacon; ${result.cloudflareHtml} Cloudflare pages contain none`,
  )
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main()
