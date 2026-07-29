import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const mainSource = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
const routeViewsSource = readFileSync(new URL('../src/app/routeViews.ts', import.meta.url), 'utf8')

test('the client entry does not eagerly import every route after hydration', () => {
  assert.doesNotMatch(mainSource, /\bpreloadRouteViews\b/)
  assert.doesNotMatch(routeViewsSource, /Promise\.all\(Object\.values\(PAGE_LOADERS\)/)
})

test('the client entry installs stale-preload recovery before route imports run', () => {
  const installIndex = mainSource.indexOf('installVitePreloadRecovery()')
  const initialViewIndex = mainSource.indexOf('loadInitialRouteViews(window.location.pathname)')

  assert.notEqual(installIndex, -1)
  assert.notEqual(initialViewIndex, -1)
  assert.ok(installIndex < initialViewIndex)
})
