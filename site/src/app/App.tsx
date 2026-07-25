import { lazy, Suspense } from 'react'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '../theme/ThemeContext'
import ErrorBoundary from '../components/layout/ErrorBoundary'
import Shell from '../components/layout/Shell'
import { RouteMeta } from '../components/seo/RouteMeta'
import { AnalyticsRouteTracker } from '../analytics/AnalyticsRouteTracker'

const Home = lazy(() => import('../pages/Home'))
const PartPage = lazy(() => import('../pages/PartPage'))
const TypePage = lazy(() => import('../pages/TypePage'))
const NotFound = lazy(() => import('../pages/NotFound'))
const AboutPage = lazy(() => import('../pages/AboutPage'))
const MethodPage = lazy(() => import('../pages/MethodPage'))
const ProblemsPage = lazy(() => import('../pages/ProblemsPage'))

function AppContent() {
  return (
    <ThemeProvider>
      <RouteMeta />
      <AnalyticsRouteTracker />
      <ErrorBoundary>
        <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
          <Routes>
            <Route element={<Shell />}>
              <Route path="/" element={<Home />} />
              <Route path="/part/:pid" element={<PartPage />} />
              <Route path="/part/:pid/:slug" element={<TypePage />} />
              <Route path="/method" element={<MethodPage />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export function StaticApp({ url }: { url: string }) {
  return (
    <MemoryRouter initialEntries={[url]}>
      <AppContent />
    </MemoryRouter>
  )
}
