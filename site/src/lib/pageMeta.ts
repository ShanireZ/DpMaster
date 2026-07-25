import { BRAND, SITE_CONFIGS, SITE_ORIGIN, getRuntimeSiteConfig } from '../config/site.ts'
import type { SiteConfig } from '../config/site.ts'
import { getLesson, getPart } from '../data/catalog.ts'
import { getLessonEditorial } from '../data/editorial.ts'
import { ROUTE_LAST_MODIFIED } from '../data/routeLastModified.ts'

export { SITE_ORIGIN }

export interface BreadcrumbItem {
  name: string
  path: string
}

export interface PageMeta {
  path: string
  title: string
  description: string
  summary: string
  canonical: string | null
  alternates: ReadonlyArray<{ hreflang: string; href: string }>
  ogType: 'website' | 'article'
  routeKind: 'home' | 'family' | 'lesson' | 'static' | 'not-found'
  indexable: boolean
  breadcrumbs: ReadonlyArray<BreadcrumbItem>
  dateModified?: string
  teaches: ReadonlyArray<string>
  reviewedBy?: string
  reviewStatus?: string
}

const HOME_DESCRIPTION =
  'DP大师是一套面向算法学习者的动态规划交互式教程，通过精讲、逐帧可视化、题目索引和小游戏掌握 DP。'

const STATIC_META: Record<
  string,
  { title: string; description: string; breadcrumb: string }
> = {
  '/method': {
    title: `通用方法论 · ${BRAND.name}`,
    description:
      '用状态设计、转移方程、计算顺序、空间优化和调试清单，建立可复用的动态规划解题方法。',
    breadcrumb: '通用方法论',
  },
  '/problems': {
    title: `题目索引 · ${BRAND.name}`,
    description:
      '按 DP 家族、课程、难度和关键词检索教程中的例题与练习，快速定位对应的洛谷题目和学习路径。',
    breadcrumb: '题目索引',
  },
  '/about': {
    title: `关于 · ${BRAND.name}`,
    description:
      `了解${BRAND.name}的教学目标、使用方式、内容边界、开源说明与反馈渠道，更高效地使用交互式 DP 课程。`,
    breadcrumb: '关于',
  },
}

export function normalizePathname(pathname: string): string {
  const path = (pathname.split(/[?#]/, 1)[0] || '/').replace(/\/{2,}/g, '/')
  return path.length > 1 ? path.replace(/\/$/, '') : '/'
}

function href(origin: string, path: string): string {
  return `${origin}${path}`
}

function alternates(path: string): PageMeta['alternates'] {
  return [
    {
      hreflang: SITE_CONFIGS.international.hreflang,
      href: href(SITE_CONFIGS.international.origin, path),
    },
    {
      hreflang: SITE_CONFIGS.china.hreflang,
      href: href(SITE_CONFIGS.china.origin, path),
    },
    {
      hreflang: 'x-default',
      href: href(SITE_CONFIGS.international.origin, path),
    },
  ]
}

function meta(
  site: SiteConfig,
  path: string,
  title: string,
  description: string,
  routeKind: PageMeta['routeKind'],
  breadcrumbs: PageMeta['breadcrumbs'],
  ogType: PageMeta['ogType'] = 'website',
  options: {
    summary?: string
    teaches?: ReadonlyArray<string>
    reviewedBy?: string
    reviewStatus?: string
    dateModified?: string
  } = {},
): PageMeta {
  return {
    path,
    title,
    description,
    summary: options.summary ?? description,
    canonical: href(site.origin, path),
    alternates: alternates(path),
    ogType,
    routeKind,
    indexable: true,
    breadcrumbs,
    dateModified: options.dateModified ?? ROUTE_LAST_MODIFIED[path],
    teaches: options.teaches ?? [],
    reviewedBy: options.reviewedBy,
    reviewStatus: options.reviewStatus,
  }
}

export function getPageMeta(
  pathname: string,
  site: SiteConfig = getRuntimeSiteConfig(),
  lastModified?: string,
): PageMeta {
  const path = normalizePathname(pathname)
  if (path === '/') {
    return meta(
      site,
      '/',
      `${BRAND.name} · ${BRAND.shortDescription}`,
      HOME_DESCRIPTION,
      'home',
      [{ name: '首页', path: '/' }],
      'website',
      { dateModified: lastModified },
    )
  }

  const staticMeta = STATIC_META[path]
  if (staticMeta) {
    return meta(
      site,
      path,
      staticMeta.title,
      staticMeta.description,
      'static',
      [
        { name: '首页', path: '/' },
        { name: staticMeta.breadcrumb, path },
      ],
      'website',
      { dateModified: lastModified },
    )
  }

  const familyMatch = path.match(/^\/part\/([^/]+)$/)
  if (familyMatch) {
    const part = getPart(familyMatch[1])
    if (part) {
      return meta(
        site,
        path,
        `${part.title} · ${BRAND.name}`,
        `${part.title}：${part.tagline}通过 ${part.types.length} 门系统课程、逐帧演示和互动游戏建立完整知识谱系。`,
        'family',
        [
          { name: '首页', path: '/' },
          { name: part.title, path },
        ],
        'website',
        {
          summary:
            `${part.title}学习路径以“${part.tagline}”为主线，串联 ${part.types.length} 门课程的状态模型、转移顺序、可视化验证与配套题目。`,
          teaches: part.types.map((type) => type.title),
          dateModified: lastModified,
        },
      )
    }
  }

  const lessonMatch = path.match(/^\/part\/([^/]+)\/([^/]+)$/)
  if (lessonMatch) {
    const lesson = getLesson(lessonMatch[1], lessonMatch[2])
    if (lesson?.type.status === 'ready') {
      const editorial = getLessonEditorial(lesson)
      return meta(
        site,
        path,
        `${lesson.type.title} · ${lesson.part.title} · ${BRAND.name}`,
        `${lesson.type.title}是${BRAND.name}「${lesson.part.title}」家族课程：${lesson.type.blurb}。通过状态定义、转移推导、可编辑演示和配套题目掌握这一类 DP。`,
        'lesson',
        [
          { name: '首页', path: '/' },
          { name: lesson.part.title, path: `/part/${lesson.part.id}` },
          { name: lesson.type.title, path },
        ],
        'article',
        {
          summary: editorial.summary,
          teaches: editorial.outcomes,
          reviewedBy: editorial.reviewedBy,
          reviewStatus: editorial.reviewStatus,
          dateModified: lastModified,
        },
      )
    }
  }

  return {
    path,
    title: `页面未找到 · ${BRAND.name}`,
    description: `该页面不在${BRAND.name}当前的课程目录中，请返回首页、家族目录或题目索引继续学习动态规划。`,
    summary: '请求的页面不在当前课程目录中。',
    canonical: null,
    alternates: [],
    ogType: 'website',
    routeKind: 'not-found',
    indexable: false,
    breadcrumbs: [{ name: '页面未找到', path }],
    teaches: [],
  }
}
