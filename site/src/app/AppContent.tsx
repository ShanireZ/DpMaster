import { Suspense, type ComponentType } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '../theme/ThemeContext'
import ErrorBoundary from '../components/layout/ErrorBoundary'
import Shell from '../components/layout/Shell'
import { RouteMeta } from '../components/seo/RouteMeta'
import { AnalyticsRouteTracker } from '../analytics/AnalyticsRouteTracker'
import { AnalyticsRuntime } from '../analytics/AnalyticsRuntime'
import { LearningProgressProvider } from '../learning/LearningProgressContext'
import type { RouteViews } from './routeViews.ts'

function RouteView({ View }: { View: ComponentType }) {
  return (
    <Suspense
      fallback={(
        <div
          className="route-view-loading"
          role="status"
          aria-label="页面载入中"
        />
      )}
    >
      <View />
    </Suspense>
  )
}

export function AppContent({ views }: { views: RouteViews }) {
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
          <Routes>
            <Route element={<Shell />}>
              <Route path="/" element={<RouteView View={HomeView} />} />
              <Route path="/part/:pid" element={<RouteView View={PartPageView} />} />
              <Route path="/part/:pid/:slug" element={<RouteView View={TypePageView} />} />
              <Route path="/method" element={<RouteView View={MethodPageView} />} />
              <Route path="/problems" element={<RouteView View={ProblemsPageView} />} />
              <Route path="/about" element={<RouteView View={AboutPageView} />} />
              <Route path="*" element={<RouteView View={NotFoundView} />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </LearningProgressProvider>
    </ThemeProvider>
  )
}
