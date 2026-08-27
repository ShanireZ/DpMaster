// 构建产物的 HTML 合同门禁。
//
// 1. 每条预渲染路由都要落成 `<route>.html` 与 `<route>/index.html` 两份，加上
//    首页的 index.html 和真实 404.html —— Worker 的静态资源绑定按这两种形态命中。
// 2. 任何 HTML 都不得包含手工注入的 Cloudflare Web Analytics beacon：
//    Cloudflare 代理会自动注入，手工再来一份就是重复统计。

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { markdownAssetRelativePath } from '../src/lib/publicWebContract.ts'
import { PRERENDER_PATHS, PUBLIC_PATHS } from '../src/lib/publicRoutes.ts'
import { renderMarkdownRepresentation } from './markdown-representation.mjs'

const MANUAL_BEACON_MARKERS = Object.freeze([
  '<!-- Cloudflare Web Analytics -->',
  'static.cloudflareinsights.com',
  'data-cf-beacon',
])

function htmlFilesUnder(root) {
  const files = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name)
    if (entry.isDirectory()) files.push(...htmlFilesUnder(path))
    else if (entry.isFile() && extname(entry.name) === '.html') files.push(path)
  }
  return files
}

function filesUnder(root, extension) {
  if (!existsSync(root)) return []
  const files = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name)
    if (entry.isDirectory()) files.push(...filesUnder(path, extension))
    else if (entry.isFile() && extname(entry.name) === extension) files.push(path)
  }
  return files
}

function htmlAssetRelativePath(pathname) {
  return pathname === '/' ? 'index.html' : `${pathname.slice(1)}/index.html`
}

function hasLegalHeadingHierarchy(markdown) {
  const levels = []
  let fence = null
  for (const line of markdown.split('\n')) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1]
    if (marker) {
      if (fence === null) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null
      continue
    }
    if (fence !== null) continue
    const level = /^(#{1,6})\s+\S/.exec(line)?.[1].length
    if (level !== undefined) levels.push(level)
  }
  if (levels.length === 0 || levels[0] !== 1) return false
  if (levels.filter((level) => level === 1).length !== 1) return false
  return levels.slice(1).every((level, index) => level <= levels[index] + 1)
}

function markdownLinkTargets(markdown) {
  return [...markdown.matchAll(/!?\[[^\]]*\]\(([^)\s]+)\)/g)]
    .map((match) => match[1])
}

export function expectedHtmlCount(paths = PRERENDER_PATHS) {
  // 首页只有 index.html，其余每条路由两份，再加一个 404.html。
  return 1 + (paths.length - 1) * 2 + 1
}

export function checkMarkdownRepresentations({
  dir = resolve('dist'),
  paths = PUBLIC_PATHS,
  origin = 'https://dp.round1.cc',
} = {}) {
  const representationRoot = join(dir, '_representations', 'markdown')
  const actual = filesUnder(representationRoot, '.md')
    .map((path) => relative(dir, path).replaceAll('\\', '/'))
    .sort()
  const expected = paths.map(markdownAssetRelativePath).sort()
  const actualSet = new Set(actual)
  const expectedSet = new Set(expected)
  const publicPathSet = new Set(paths)
  const errors = []

  for (const path of expected.filter((path) => !actualSet.has(path))) {
    errors.push(`Markdown representation is missing: ${path}`)
  }
  for (const path of actual.filter((path) => !expectedSet.has(path))) {
    errors.push(`Markdown representation is unexpected: ${path}`)
  }

  for (const pathname of paths) {
    const relativeMarkdown = markdownAssetRelativePath(pathname)
    if (!actualSet.has(relativeMarkdown)) continue
    const markdownPath = join(dir, relativeMarkdown)
    const markdown = readFileSync(markdownPath, 'utf8')
    const canonical = `${origin}${pathname}`
    const htmlPath = join(dir, htmlAssetRelativePath(pathname))

    if (!/^#\s+\S/m.test(markdown)) {
      errors.push(`Markdown representation has no heading: ${relativeMarkdown}`)
    } else if (!hasLegalHeadingHierarchy(markdown)) {
      errors.push(`Markdown representation has an illegal heading hierarchy: ${relativeMarkdown}`)
    }
    if (/<(?:script|style|button|input|textarea|select|form)\b/i.test(markdown)) {
      errors.push(`Markdown representation contains browser-only markup: ${relativeMarkdown}`)
    }
    if (/\/_representations\/markdown\//i.test(markdown)) {
      errors.push(`Markdown representation leaks an internal representation path: ${relativeMarkdown}`)
    }
    if (!markdown.includes(`[在原页面查看完整互动内容](${canonical})`)) {
      errors.push(`Markdown representation lacks its canonical interactive-content link: ${relativeMarkdown}`)
    }
    for (const target of markdownLinkTargets(markdown)) {
      let url
      try {
        url = new URL(target, canonical)
      } catch {
        errors.push(`Markdown representation has an invalid public link: ${relativeMarkdown} -> ${target}`)
        continue
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        errors.push(`Markdown representation has an invalid public link: ${relativeMarkdown} -> ${target}`)
        continue
      }
      if (url.origin !== origin || publicPathSet.has(url.pathname)) continue
      let assetPath = null
      try {
        assetPath = join(dir, decodeURIComponent(url.pathname).replace(/^\/+/, ''))
      } catch {
        // The URL parsed, but an invalid percent escape still makes the target unusable.
      }
      if (!assetPath || !existsSync(assetPath)) {
        errors.push(`Markdown representation has an unresolved same-origin link: ${relativeMarkdown} -> ${url.href}`)
      }
    }
    if (!existsSync(htmlPath)) {
      errors.push(`Markdown representation has no matching HTML asset: ${relativeMarkdown}`)
    } else {
      const html = readFileSync(htmlPath, 'utf8')
      const document = new JSDOM(html).window.document
      const summary = document.querySelector('meta[name="abstract"]')?.getAttribute('content') ?? ''
      const expected = renderMarkdownRepresentation({ html, canonical, summary })
      const repeated = renderMarkdownRepresentation({ html, canonical, summary })
      if (expected !== repeated) {
        errors.push(`Markdown representation is not deterministic: ${relativeMarkdown}`)
      }
      if (markdown !== expected) {
        errors.push(`Markdown representation does not match semantic HTML: ${relativeMarkdown}`)
      }
      if (Buffer.byteLength(markdown) >= Buffer.byteLength(html) / 2) {
        errors.push(`Markdown representation is not compact enough: ${relativeMarkdown}`)
      }
    }
  }

  return { ok: errors.length === 0, markdownFiles: actual.length, errors }
}

export function checkBuildHtml({ dir = resolve('dist') } = {}) {
  const htmlFiles = htmlFilesUnder(dir)
  const expected = expectedHtmlCount()
  const markdown = checkMarkdownRepresentations({ dir })
  const errors = [...markdown.errors]

  if (htmlFiles.length !== expected) {
    errors.push(`HTML count ${htmlFiles.length} does not match ${expected}`)
  }

  for (const path of htmlFiles) {
    const html = readFileSync(path, 'utf8')
    const leaked = MANUAL_BEACON_MARKERS.filter((marker) => html.includes(marker))
    if (leaked.length > 0) {
      errors.push(`Manual Web Analytics beacon leaked into ${path}: ${leaked.join(', ')}`)
    }
  }

  return {
    ok: errors.length === 0,
    htmlFiles: htmlFiles.length,
    markdownFiles: markdown.markdownFiles,
    errors,
  }
}

function main() {
  const result = checkBuildHtml()
  if (!result.ok) {
    for (const error of result.errors) console.error(`[html] ${error}`)
    process.exitCode = 1
    return
  }
  console.log(
    `[html] ${result.htmlFiles} pages and ${result.markdownFiles} compact Markdown representations passed`,
  )
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main()
