import { JSDOM } from 'jsdom'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { markdownAssetRelativePath } from '../src/lib/publicWebContract.ts'

const SKIPPED_TAGS = new Set([
  'button',
  'canvas',
  'form',
  'input',
  'nav',
  'noscript',
  'script',
  'select',
  'style',
  'template',
  'textarea',
])

function compact(value) {
  return value.replaceAll('\u00a0', ' ').replace(/\s+/g, ' ').trim()
}

function renderChildren(element, context) {
  return [...element.childNodes].map((child) => renderNode(child, context)).join('')
}

function texFor(element) {
  return compact(
    element.querySelector('annotation[encoding="application/x-tex"]')?.textContent ?? '',
  )
}

function renderFigure(element, context) {
  const visual = element.querySelector('[role="img"][aria-label], svg[aria-label]')
  const image = element.querySelector('img[alt]:not([alt=""])')
  const caption = compact(element.querySelector('figcaption')?.textContent ?? '')
  const label = compact(visual?.getAttribute('aria-label') ?? image?.getAttribute('alt') ?? '')
  const description = [label, caption].filter(Boolean).join(label && caption ? '。' : '')
  if (description) return `\n\n> 图示：${description}\n\n`
  return renderChildren(element, context)
}

function renderTable(element, context) {
  const rows = [...element.querySelectorAll('tr')].map((row) => (
    [...row.querySelectorAll(':scope > th, :scope > td')]
      .map((cell) => compact(renderChildren(cell, context)).replaceAll('|', '\\|'))
  )).filter((row) => row.length > 0)
  if (rows.length === 0) return ''
  const width = Math.max(...rows.map((row) => row.length))
  const normalized = rows.map((row) => [...row, ...Array(width - row.length).fill('')])
  return [
    '',
    `| ${normalized[0].join(' | ')} |`,
    `| ${Array(width).fill('---').join(' | ')} |`,
    ...normalized.slice(1).map((row) => `| ${row.join(' | ')} |`),
    '',
  ].join('\n')
}

function renderList(element, context, ordered) {
  const items = [...element.querySelectorAll(':scope > li')]
  return `\n${items.map((item, index) => {
    const marker = ordered ? `${index + 1}.` : '-'
    const body = compact(renderChildren(item, context)).replace(/\n+/g, '\n  ')
    return `${marker} ${body}`
  }).join('\n')}\n\n`
}

function renderNode(node, context) {
  if (node.nodeType === 3) return node.nodeValue?.replace(/\s+/g, ' ') ?? ''
  if (node.nodeType !== 1) return ''

  const element = node
  const tag = element.tagName.toLowerCase()
  if (
    SKIPPED_TAGS.has(tag)
    || element.hasAttribute('hidden')
    || element.getAttribute('aria-hidden') === 'true'
    || element.classList.contains('lesson-outline')
  ) return ''

  if (element.classList.contains('katex-display')) {
    const tex = texFor(element)
    return tex ? `\n\n$$\n${tex}\n$$\n\n` : ''
  }
  if (element.classList.contains('katex')) {
    const tex = texFor(element)
    return tex ? `$${tex}$` : ''
  }

  if (tag === 'figure') return renderFigure(element, context)
  if (tag === 'table') return renderTable(element, context)
  if (tag === 'ul') return renderList(element, context, false)
  if (tag === 'ol') return renderList(element, context, true)
  if (tag === 'pre') {
    const code = (element.querySelector('code')?.textContent ?? element.textContent ?? '').trimEnd()
    const language = /#include\s*<|using\s+namespace\s+std/.test(code) ? 'cpp' : ''
    return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`
  }
  if (/^h[1-6]$/.test(tag)) {
    const sourceLevel = Number(tag[1])
    const level = context.lastHeadingLevel === 0
      ? 1
      : Math.min(sourceLevel, context.lastHeadingLevel + 1)
    context.lastHeadingLevel = level
    return `\n\n${'#'.repeat(level)} ${compact(renderChildren(element, context))}\n\n`
  }
  if (tag === 'p') return `\n\n${compact(renderChildren(element, context))}\n\n`
  if (tag === 'blockquote') {
    return `\n\n${compact(renderChildren(element, context)).split('\n').map((line) => `> ${line}`).join('\n')}\n\n`
  }
  if (tag === 'strong' || tag === 'b') return `**${compact(renderChildren(element, context))}**`
  if (tag === 'em' || tag === 'i') return `_${compact(renderChildren(element, context))}_`
  if (tag === 'code') return `\`${compact(element.textContent ?? '')}\``
  if (tag === 'br') return '\n'
  if (tag === 'hr') return '\n\n---\n\n'
  if (tag === 'a') {
    const label = compact(renderChildren(element, context))
    const href = element.getAttribute('href')
    if (!label || !href || /^javascript:/i.test(href)) return label
    return `[${label}](${new URL(href, context.canonical).href})`
  }
  if (tag === 'img') {
    const alt = compact(element.getAttribute('alt') ?? '')
    const src = element.getAttribute('src')
    if (!alt || !src) return ''
    return `![${alt}](${new URL(src, context.canonical).href})`
  }
  if (tag === 'svg' || element.getAttribute('role') === 'img') {
    const label = compact(element.getAttribute('aria-label') ?? '')
    return label ? `\n\n> 图示：${label}\n\n` : ''
  }
  if (tag === 'summary') return `\n\n**${compact(renderChildren(element, context))}**\n\n`

  const rendered = renderChildren(element, context)
  if (['article', 'details', 'div', 'header', 'main', 'section'].includes(tag)) {
    return `\n${rendered}\n`
  }
  return rendered
}

export function renderMarkdownRepresentation({ html, canonical, summary }) {
  const document = new JSDOM(html).window.document
  const main = document.querySelector('main')
  if (!main) throw new Error(`Prerendered route ${canonical} is missing <main>`)

  const body = renderNode(main, { canonical, lastHeadingLevel: 0 })
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  const summaryBlock = summary ? `> ${compact(summary)}\n\n` : ''
  return `${summaryBlock}${body}\n\n---\n\n[在原页面查看完整互动内容](${canonical})\n`
}

export function writeMarkdownRepresentation({
  outDir,
  pathname,
  html,
  canonical,
  summary,
}) {
  const relative = markdownAssetRelativePath(pathname)
  const output = join(outDir, relative)
  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(
    output,
    renderMarkdownRepresentation({ html, canonical, summary }),
    'utf8',
  )
  return relative.replaceAll('\\', '/')
}
