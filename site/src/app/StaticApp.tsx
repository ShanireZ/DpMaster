import { lazy } from 'react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'
import PartPage from '../pages/PartPage'
import TypePage from '../pages/TypePage'
import AboutPage from '../pages/AboutPage'
import MethodPage from '../pages/MethodPage'
import ProblemsPage from '../pages/ProblemsPage'
import { AppContent } from './AppContent.tsx'
import type { RouteViews } from './routeViews.ts'
import {
  StaticLessonContentProvider,
} from './StaticLessonContentContext.tsx'
import type { StaticLessonContents } from './StaticLessonContent.ts'

const NotFound = lazy(() => import('../pages/NotFound'))

const STATIC_VIEWS: RouteViews = {
  Home,
  PartPage,
  TypePage,
  NotFound,
  AboutPage,
  MethodPage,
  ProblemsPage,
}

export function StaticApp({
  url,
  lessonContents,
}: {
  url: string
  lessonContents: StaticLessonContents
}) {
  return (
    <MemoryRouter initialEntries={[url]}>
      <StaticLessonContentProvider contents={lessonContents}>
        <AppContent views={STATIC_VIEWS} />
      </StaticLessonContentProvider>
    </MemoryRouter>
  )
}
