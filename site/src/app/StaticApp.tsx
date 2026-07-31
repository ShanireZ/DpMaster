import { lazy } from 'react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'
import PartPage from '../pages/PartPage'
import TypePage from '../pages/TypePage'
import MethodPage from '../pages/MethodPage'
import ProblemsPage from '../pages/ProblemsPage'
import BodyDemoStandardPage from '../pages/BodyDemoStandardPage'
import { AppContent } from './AppContent.tsx'
import type { RouteViews } from './routeViews.ts'
import {
  StaticLessonContentProvider,
} from './StaticLessonContentContext.tsx'
import type { StaticLessonContents } from './StaticLessonContent.ts'
import {
  StaticFamilyArtProvider,
} from '../components/art/StaticFamilyArtContext.tsx'
import type {
  StaticFamilyArtModules,
} from '../components/art/familyArtRegistry.ts'

const NotFound = lazy(() => import('../pages/NotFound'))

const STATIC_VIEWS: RouteViews = {
  Home,
  PartPage,
  TypePage,
  NotFound,
  MethodPage,
  ProblemsPage,
  BodyDemoStandardPage,
}

export function StaticApp({
  familyArt,
  url,
  lessonContents,
}: {
  familyArt: StaticFamilyArtModules
  url: string
  lessonContents: StaticLessonContents
}) {
  return (
    <MemoryRouter initialEntries={[url]}>
      <StaticFamilyArtProvider modules={familyArt}>
        <StaticLessonContentProvider contents={lessonContents}>
          <AppContent views={STATIC_VIEWS} />
        </StaticLessonContentProvider>
      </StaticFamilyArtProvider>
    </MemoryRouter>
  )
}
