import type { ComponentType } from 'react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'
import PartPage from '../pages/PartPage'
import TypePage from '../pages/TypePage'
import NotFound from '../pages/NotFound'
import AboutPage from '../pages/AboutPage'
import MethodPage from '../pages/MethodPage'
import ProblemsPage from '../pages/ProblemsPage'
import { PARTS } from '../data/catalog.ts'
import { AppContent } from './App.tsx'
import type { RouteViews } from './routeViews.ts'
import {
  StaticLessonContentProvider,
} from './StaticLessonContentContext.tsx'
import type { StaticLessonContents } from './StaticLessonContent.ts'

const STATIC_MODULES = import.meta.glob<{ default: ComponentType }>(
  '../content/**/*.tsx',
  { eager: true },
)

const STATIC_LESSON_CONTENTS: StaticLessonContents = Object.freeze(
  Object.fromEntries(
    PARTS.flatMap((part) =>
      part.types
        .filter((type) => type.status === 'ready')
        .map((type) => {
          const content = STATIC_MODULES[type.contentSource]?.default
          if (!content) throw new Error(`Missing static lesson content: ${type.contentSource}`)
          return [`/part/${part.id}/${type.slug}`, content]
        }),
    ),
  ),
)

const STATIC_VIEWS: RouteViews = {
  Home,
  PartPage,
  TypePage,
  NotFound,
  AboutPage,
  MethodPage,
  ProblemsPage,
}

export function StaticApp({ url }: { url: string }) {
  return (
    <MemoryRouter initialEntries={[url]}>
      <StaticLessonContentProvider contents={STATIC_LESSON_CONTENTS}>
        <AppContent views={STATIC_VIEWS} />
      </StaticLessonContentProvider>
    </MemoryRouter>
  )
}
