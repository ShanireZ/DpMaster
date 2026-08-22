import { BRAND } from '../config/site.ts'
import type { SiteConfig } from '../config/site.ts'
import { PARTS } from '../data/catalog.ts'
import { getPageMeta } from './pageMeta.ts'
import { PUBLIC_PATHS } from './publicRoutes.ts'

function xml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

/**
 * 只列出**检索 / 引用类**抓取器，不列训练类。
 *
 * ★ 这份 robots.txt 到了边缘还会被 Cloudflare 的 AI Crawl Control 在前面拼上
 * 一段托管内容，那段声明 `Content-Signal: search=yes,ai-train=no,use=reference`
 * 并 Disallow 全部训练类抓取器（GPTBot / ClaudeBot / CCBot / Google-Extended /
 * Applebot-Extended / Bytespider / Amazonbot / meta-externalagent）。站点立场就是
 * 托管段那一条：**可以被检索并引用，不提供训练**。
 *
 * 所以这里只放行不被托管段拦的那几个。曾经把训练类也列进来，结果同一个文件里
 * 同一个 user-agent 既 Disallow 又 Allow —— 各家抓取器的分组合并与优先级实现
 * 并不一致，那种写法的实际效果是未定义的。要改立场，先改 Cloudflare Dashboard，
 * 再改这里，两边必须同向。
 */
const AI_CRAWLERS = Object.freeze([
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'Claude-User',
  'Claude-SearchBot',
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
  const readyLessonCount = PARTS.flatMap((part) =>
    part.types.filter((type) => type.status === 'ready'),
  ).length

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...summaries.flatMap((entry) => [
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
    '# AI 检索与引用抓取器：欢迎引用本站课程，请保留原文链接与页面标题。',
    '# 训练类抓取器不在此列 —— 站点立场是「可检索引用、不提供训练」。',
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
    `- 课程由${BRAND.owner}持续维护；“最近更新”取自构建时 Git 历史，不使用模板日期。`,
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
