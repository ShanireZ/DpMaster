import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '../theme/ThemeContext'
import Shell from '../components/layout/Shell'

const Home = lazy(() => import('../pages/Home'))
const PartPage = lazy(() => import('../pages/PartPage'))
const TypePage = lazy(() => import('../pages/TypePage'))
const NotFound = lazy(() => import('../pages/NotFound'))

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
          <Routes>
            <Route element={<Shell />}>
              <Route path="/" element={<Home />} />
              <Route path="/part/:pid" element={<PartPage />} />
              <Route path="/part/:pid/:slug" element={<TypePage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
