import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '../theme/ThemeContext'
import Shell from '../components/layout/Shell'
import Placeholder from '../pages/Placeholder'

const Home = lazy(() => import('../pages/Home'))
const PartPage = lazy(() => import('../pages/PartPage'))
const TypePage = lazy(() => import('../pages/TypePage'))

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
              <Route path="/method" element={<Placeholder title="DP 通用方法论" />} />
              <Route path="/problems" element={<Placeholder title="题目索引" />} />
              <Route path="/about" element={<Placeholder title="关于 · 如何使用" />} />
              <Route path="*" element={<Placeholder title="页面不存在" />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
