import { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '../theme/ThemeContext'
import ErrorBoundary from '../components/layout/ErrorBoundary'
import Shell from '../components/layout/Shell'
import { RouteMeta } from '../components/seo/RouteMeta'
import { AnalyticsRouteTracker } from '../analytics/AnalyticsRouteTracker'
import { AnalyticsRuntime } from '../analytics/AnalyticsRuntime'
import { LearningProgressProvider } from '../learning/LearningProgressContext'
import { StaticLessonContentProvider } from './StaticLessonContentContext.tsx'
import type { StaticLessonContents } from './StaticLessonContent.ts'
import { CLIENT_ROUTE_VIEWS, type RouteViews } from './routeViews.ts'

export function AppContent({ views = CLIENT_ROUTE_VIEWS }: { views?: RouteViews }) {
  const {
    Home: HomeView,
    PartPage: PartPageView,
    TypePage: TypePageView,
    NotFound: NotFoundView,
    AboutPage: AboutPageView,
    MethodPage: MethodPageView,
    ProblemsPage: ProblemsPageView,
  } = views

  return (
    <ThemeProvider>
      <LearningProgressProvider>
        <RouteMeta />
        <AnalyticsRouteTracker />
        <AnalyticsRuntime />
        <ErrorBoundary>
          <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
            <Routes>
              <Route element={<Shell />}>
                <Route path="/" element={<HomeView />} />
                <Route path="/part/:pid" element={<PartPageView />} />
                <Route path="/part/:pid/:slug" element={<TypePageView />} />
                <Route path="/method" element={<MethodPageView />} />
                <Route path="/problems" element={<ProblemsPageView />} />
                <Route path="/about" element={<AboutPageView />} />
                <Route path="*" element={<NotFoundView />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </LearningProgressProvider>
    </ThemeProvider>
  )
}

export default function App({
  initialLessonContents = {},
  views,
}: {
  initialLessonContents?: StaticLessonContents
  views?: RouteViews
}) {
  return (
    <BrowserRouter>
      <StaticLessonContentProvider contents={initialLessonContents}>
        <AppContent views={views} />
      </StaticLessonContentProvider>
    </BrowserRouter>
  )
}
