import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const src = new URL('../src/', import.meta.url)

async function source(path) {
  return readFile(new URL(path, src), 'utf8')
}

test('Shell owns skip navigation, the main target, and route announcements', async () => {
  const shell = await source('components/layout/Shell.tsx')
  assert.match(shell, /className="skip-link"[^>]*href="#main-content"/)
  assert.match(shell, /<main[^>]*id="main-content"/)
  assert.match(shell, /tabIndex=\{-1\}/)
  assert.match(shell, /aria-live="polite"/)
  assert.match(shell, /aria-atomic="true"/)
  assert.match(shell, /getPageMeta\(location\.pathname\)/)
})

test('Shell focuses main only after pathname changes', async () => {
  const shell = await source('components/layout/Shell.tsx')
  assert.match(shell, /const mainRef = useRef<HTMLElement>\(null\)/)
  assert.match(shell, /const previousPath = useRef\(location\.pathname\)/)
  assert.match(shell, /<main[^>]*ref=\{mainRef\}/)
  assert.match(
    shell,
    /const changed = previousPath\.current !== location\.pathname[\s\S]*previousPath\.current = location\.pathname[\s\S]*setMobileOpen\(false\)[\s\S]*window\.scrollTo\(\{ top: 0 \}\)[\s\S]*if \(changed\) mainRef\.current\?\.focus\(\{ preventScroll: true \}\)/,
  )
})

test('navigation and breadcrumbs expose current-page semantics', async () => {
  const [sidebar, topbar] = await Promise.all([
    source('components/layout/Sidebar.tsx'),
    source('components/layout/TopBar.tsx'),
  ])
  assert.doesNotMatch(sidebar, /import \{[^}]*\bLink\b/)
  assert.match(sidebar, /<NavLink[\s\S]*className="brand"/)
  assert.match(sidebar, /to=\{`\/part\/\$\{p\.id\}`\}[\s\S]*\bend/)
  assert.match(topbar, /aria-current="page"/)
  assert.match(topbar, /<NavLink[^>]*to="\/"[^>]*end/)
})

test('mobile navigation uses buttons and reports expanded state', async () => {
  const [shell, topbar] = await Promise.all([
    source('components/layout/Shell.tsx'),
    source('components/layout/TopBar.tsx'),
  ])
  assert.match(shell, /<button[\s\S]*className=\{`sidebar__scrim/)
  assert.match(shell, /aria-label="关闭导航"/)
  assert.doesNotMatch(shell, /<div[^>]*sidebar__scrim[^>]*onClick/)
  assert.match(topbar, /aria-expanded=\{mobileOpen\}/)
  assert.match(topbar, /aria-controls="site-sidebar"/)
})

test('focus and reduced-motion CSS preserve visible content and navigation', async () => {
  const [shellCss, globalCss] = await Promise.all([
    source('components/layout/shell.css'),
    source('styles/global.css'),
  ])
  assert.match(shellCss, /\.skip-link:focus-visible/)
  assert.match(shellCss, /\.nav-part:focus-visible/)
  assert.match(globalCss, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(globalCss, /scroll-behavior:\s*auto/)
  assert.match(globalCss, /animation-duration:\s*0\.001ms !important/)
  assert.doesNotMatch(globalCss, /visibility:\s*hidden[^}]*prefers-reduced-motion/s)
})

test('key layout icon buttons have accessible names', async () => {
  const topbar = await source('components/layout/TopBar.tsx')
  const buttons = [...topbar.matchAll(/<button[\s\S]*?<\/button>/g)].map((match) => match[0])
  assert.ok(buttons.length >= 2)
  assert.ok(buttons.every((button) => /aria-label=/.test(button)))
})

test('each route host owns exactly one page-level heading', async () => {
  const pages = [
    'pages/Home.tsx',
    'pages/PartPage.tsx',
    'pages/TypePage.tsx',
    'pages/MethodPage.tsx',
    'pages/ProblemsPage.tsx',
    'pages/AboutPage.tsx',
    'pages/NotFound.tsx',
  ]
  for (const path of pages) {
    const page = await source(path)
    assert.equal((page.match(/<h1\b/g) || []).length, 1, path)
  }
})
