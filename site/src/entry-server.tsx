import { StrictMode } from 'react'
import { prerender } from 'react-dom/static'
import { StaticApp } from './app/StaticApp.tsx'
import type { StaticLessonContents } from './app/StaticLessonContent.ts'
import { getLesson } from './data/catalog.ts'
import { loadFamilyArtForPath } from './components/art/familyArtRegistry.ts'

async function loadLessonContents(pathname: string): Promise<StaticLessonContents> {
  const match = pathname.match(/^\/part\/([a-g])\/([^/]+)$/)
  if (!match) return {}
  const lesson = getLesson(match[1], match[2])
  if (!lesson) return {}
  const module = await lesson.type.loadContent()
  return { [lesson.path]: module.default }
}

export async function renderRoute(pathname: string): Promise<string> {
  const errors: unknown[] = []
  const [lessonContents, familyArt] = await Promise.all([
    loadLessonContents(pathname),
    loadFamilyArtForPath(pathname),
  ])
  const { prelude } = await prerender(
    <StrictMode>
      <StaticApp
        url={pathname}
        lessonContents={lessonContents}
        familyArt={familyArt}
      />
    </StrictMode>,
    {
      onError(error) {
        errors.push(error)
      },
    },
  )
  const html = await new Response(prelude).text()
  if (errors.length > 0) {
    throw new AggregateError(errors, `React prerender failed for ${pathname}`)
  }
  return html
}
