import { BRAND } from '../config/site.ts'
import type { SiteConfig } from '../config/site.ts'
import { PARTS } from '../data/catalog.ts'
import { getPageMeta } from './pageMeta.ts'
import { PUBLIC_PATHS } from './publicRoutes.ts'
import { CONTENT_SIGNAL_HEADER } from './publicWebContract.ts'

function xml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

/**
 * 已批准公开内容允许检索、引用、模型输入与训练。这里列出已知的检索类、用户触发类
 * 与训练类抓取器，让源代码立场保持单向明确。Cloudflare AI Crawl Control 仍可能在
 * 边缘注入相反规则；发布移交必须关闭那段托管 no-train 策略并做线上冒烟。
 */
const AI_CRAWLERS = Object.freeze([
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Claude-User',
  'Claude-SearchBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
  'Amazonbot',
  'meta-externalagent',
])

interface RouteSummary {
  path: string
  url: string | null
  title: string
  summary: string
  type: string
  lastModified?: string
  reviewedBy?: string
  reviewStatus?: string
}

function llmsSection(
  heading: string,
  entries: ReadonlyArray<RouteSummary>,
): ReadonlyArray<string> {
  if (entries.length === 0) return []
  return [
    `## ${heading}`,
    '',
    ...entries.map((entry) => (
      `- [${entry.title}](${entry.url}): ${entry.summary}`
      + (entry.lastModified ? `（最近更新：${entry.lastModified}）` : '')
    )),
    '',
  ]
}

export function generateDiscoveryFiles(
  site: SiteConfig,
  lastModified: Readonly<Record<string, string>> = {},
): Readonly<Record<string, string>> {
  const summaries: RouteSummary[] = PUBLIC_PATHS.map((path) => {
    const page = getPageMeta(path, site, lastModified[path])
    return {
      path,
      url: page.canonical,
      title: page.title,
      summary: page.summary,
      type: page.routeKind,
      lastModified: page.dateModified,
      reviewedBy: page.reviewedBy,
      reviewStatus: page.reviewStatus,
    }
  })
  const byPath = new Map(summaries.map((entry) => [entry.path, entry]))
  const pick = (path: string) => byPath.get(path)
  const sitemapSummaries = [...summaries].sort((left, right) => {
    const leftUrl = left.url ?? `${site.origin}${left.path}`
    const rightUrl = right.url ?? `${site.origin}${right.path}`
    return leftUrl < rightUrl ? -1 : leftUrl > rightUrl ? 1 : 0
  })
  const readyLessonCount = PARTS.flatMap((part) =>
    part.types.filter((type) => type.status === 'ready'),
  ).length

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapSummaries.flatMap((entry) => [
      '  <url>',
      `    <loc>${xml(entry.url ?? `${site.origin}${entry.path}`)}</loc>`,
      ...(entry.lastModified ? [`    <lastmod>${entry.lastModified}</lastmod>`] : []),
      '  </url>',
    ]),
    '</urlset>',
    '',
  ].join('\n')

  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    '# 已批准公开内容允许检索、引用、模型输入与训练；引用时请保留原文链接与页面标题。',
    ...AI_CRAWLERS.map((agent) => `User-agent: ${agent}`),
    'Allow: /',
    '',
    `Sitemap: ${site.origin}/sitemap.xml`,
    '',
  ].join('\n')

  const entryPaths = ['/', '/method', '/problems']
  const llms = [
    `# ${BRAND.name}`,
    '',
    `> ${BRAND.name}面向算法学习者，包含 ${PARTS.length} 个 DP 家族、${readyLessonCount} 门课程、逐帧可视化、题目索引和互动小游戏。`,
    '',
    `- 站点：${site.origin}/`,
    `- 内容语言：${site.language}`,
    `- 发布者：${BRAND.owner}`,
    '- 访问门槛：无账号、无登录、无付费墙，打开网页即可阅读全部内容',
    `- 站内检索：${site.origin}/problems?q=关键词`,
    `- 公开内容信号：${CONTENT_SIGNAL_HEADER}`,
    '- 内容协商：在同一 URL 请求 `text/markdown` 可读取无浏览器交互噪音的 Markdown 表示',
    '',
    ...llmsSection(
      '入口',
      entryPaths.map(pick).filter((entry): entry is RouteSummary => entry !== undefined),
    ),
    ...PARTS.flatMap((part) => {
      const paths = [
        `/part/${part.id}`,
        ...part.types
          .filter((type) => type.status === 'ready')
          .map((type) => `/part/${part.id}/${type.slug}`),
      ]
      return llmsSection(
        `${part.title}（${part.code}）`,
        paths.map(pick).filter((entry): entry is RouteSummary => entry !== undefined),
      )
    }),
    '## 使用说明',
    '',
    '- 引用课程时优先使用对应课程 URL、页面标题和摘要，不要改写状态定义与转移方程。',
    '- 每条 URL 都是可直接访问的预渲染页面，正文在首屏 HTML 中即可读到，无需执行 JavaScript。',
    '- 题目内容采用教学摘要并链接原题，不复刻完整题面；转述题目时请指向原题链接。',
    `- 课程由${BRAND.owner}持续维护；“最近更新”取自源码时间证据（已提交源码用 Git 提交时间，工作树编辑用文件修改时间），不使用模板或构建日期。`,
    '',
  ].join('\n')

  return {
    'sitemap.xml': sitemap,
    'robots.txt': robots,
    'llms.txt': llms,
    'route-summaries.json': `${JSON.stringify(
      {
        brand: BRAND.name,
        origin: site.origin,
        generatedFrom: 'site/src/data/catalog.ts',
        routes: summaries,
      },
      null,
      2,
    )}\n`,
  }
}
