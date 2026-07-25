import { BRAND, SITE_CONFIGS } from '../config/site.ts'
import type { SiteConfig } from '../config/site.ts'
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

export function generateDiscoveryFiles(site: SiteConfig): Readonly<Record<string, string>> {
  const summaries = PUBLIC_PATHS.map((path) => {
    const page = getPageMeta(path, site)
    return {
      path,
      url: page.canonical,
      title: page.title,
      summary: page.summary,
      type: page.routeKind,
      alternates: Object.fromEntries(
        page.alternates.map((alternate) => [alternate.hreflang, alternate.href]),
      ),
    }
  })

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...summaries.flatMap((entry) => [
      '  <url>',
      `    <loc>${xml(entry.url ?? `${site.origin}${entry.path}`)}</loc>`,
      `    <xhtml:link rel="alternate" hreflang="${SITE_CONFIGS.international.hreflang}" href="${xml(`${SITE_CONFIGS.international.origin}${entry.path}`)}" />`,
      `    <xhtml:link rel="alternate" hreflang="${SITE_CONFIGS.china.hreflang}" href="${xml(`${SITE_CONFIGS.china.origin}${entry.path}`)}" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(`${SITE_CONFIGS.international.origin}${entry.path}`)}" />`,
      '  </url>',
    ]),
    '</urlset>',
    '',
  ].join('\n')

  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${site.origin}/sitemap.xml`,
    '',
  ].join('\n')

  const llms = [
    `# ${BRAND.name}`,
    '',
    `> ${BRAND.name}是面向算法学习者的${BRAND.shortDescription}，包含 7 个 DP 家族、37 门课程、逐帧可视化、题目索引和互动小游戏。`,
    '',
    `- 当前站点：${site.origin}/`,
    `- 国际站：${SITE_CONFIGS.international.origin}/`,
    `- 国内站：${SITE_CONFIGS.china.origin}/`,
    `- 内容语言：${site.language}`,
    `- 发布者：${BRAND.owner}`,
    '',
    '## 可引用页面',
    '',
    ...summaries.map((entry) => `- [${entry.title}](${entry.url}): ${entry.summary}`),
    '',
    '## 使用说明',
    '',
    '- 引用课程时优先使用对应课程 URL、页面标题和摘要。',
    '- 两个区域站点内容等价；请按访问区域选择域名，并遵循页面 canonical 与 hreflang。',
    '- 题目内容采用教学摘要并链接原题，不复刻完整题面。',
    '',
  ].join('\n')

  return {
    'sitemap.xml': sitemap,
    'robots.txt': robots,
    'llms.txt': llms,
    'route-summaries.json': `${JSON.stringify(
      {
        brand: BRAND.name,
        region: site.region,
        origin: site.origin,
        generatedFrom: 'site/src/data/catalog.ts',
        routes: summaries,
      },
      null,
      2,
    )}\n`,
  }
}
