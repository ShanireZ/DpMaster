import { getLesson, getPart } from '../data/catalog.ts'

export const SITE_ORIGIN = 'https://dp.betaoi.cc'

export interface PageMeta {
  title: string
  description: string
  canonical: string
  ogType: 'website' | 'article'
}

const HOME_DESCRIPTION =
  'DP大师是一套面向算法学习者的动态规划交互式教程，通过精讲、逐帧可视化、题目索引和小游戏掌握 DP。'

const STATIC_META: Record<string, { title: string; description: string }> = {
  '/method': {
    title: '通用方法论 · DP大师',
    description:
      '用状态设计、转移方程、计算顺序、空间优化和调试清单，建立可复用的动态规划解题方法。',
  },
  '/problems': {
    title: '题目索引 · DP大师',
    description:
      '按 DP 家族、课程、难度和关键词检索教程中的例题与练习，快速定位对应的洛谷题目和学习路径。',
  },
  '/about': {
    title: '关于 · DP大师',
    description:
      '了解 DP大师的教学目标、使用方式、内容边界、开源说明与反馈渠道，更高效地使用交互式 DP 课程。',
  },
}

function normalizePathname(pathname: string): string {
  const path = (pathname.split(/[?#]/, 1)[0] || '/').replace(/\/{2,}/g, '/')
  return path.length > 1 ? path.replace(/\/$/, '') : '/'
}

function meta(
  path: string,
  title: string,
  description: string,
  ogType: PageMeta['ogType'] = 'website',
): PageMeta {
  return { title, description, canonical: `${SITE_ORIGIN}${path}`, ogType }
}

export function getPageMeta(pathname: string): PageMeta {
  const path = normalizePathname(pathname)
  if (path === '/') return meta('/', 'DP大师 · 动态规划交互式教程', HOME_DESCRIPTION)

  const staticMeta = STATIC_META[path]
  if (staticMeta) return meta(path, staticMeta.title, staticMeta.description)

  const familyMatch = path.match(/^\/part\/([^/]+)$/)
  if (familyMatch) {
    const part = getPart(familyMatch[1])
    if (part) {
      return meta(
        path,
        `${part.title} · DP大师`,
        `${part.title}：${part.tagline}通过 ${part.types.length} 门系统课程、逐帧演示和互动游戏建立完整知识谱系。`,
      )
    }
  }

  const lessonMatch = path.match(/^\/part\/([^/]+)\/([^/]+)$/)
  if (lessonMatch) {
    const lesson = getLesson(lessonMatch[1], lessonMatch[2])
    if (lesson?.type.status === 'ready') {
      return meta(
        path,
        `${lesson.type.title} · ${lesson.part.title} · DP大师`,
        `${lesson.type.title}是 DP大师「${lesson.part.title}」家族课程：${lesson.type.blurb}。通过状态定义、转移推导、可编辑演示和配套题目掌握这一类 DP。`,
        'article',
      )
    }
  }

  return meta(
    path,
    '页面未找到 · DP大师',
    '该页面不在 DP大师当前的课程目录中，请返回首页、家族目录或题目索引继续学习动态规划。',
  )
}
