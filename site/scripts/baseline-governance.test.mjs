import assert from 'node:assert/strict'
import test from 'node:test'

import { validateWebGovernancePolicy } from './baseline-governance.mjs'

const COMPLETE_POLICY = Object.freeze({
  modernWebGuidance: {
    status: 'required',
    reviewedAt: '2026-08-26',
    skillVersion: '2026_05_16-c5e78707',
    foundationGuides: ['accessibility', 'html', 'css', 'forms', 'performance', 'security', 'privacy'],
    queries: [{ query: 'audit semantic HTML', guideIds: ['html'], scope: ['site'] }],
    applicablePaths: ['src', 'worker.js'],
    deviations: [],
    verification: ['pnpm verify'],
  },
  sitemap: {
    status: 'enabled',
    canonicalOrigin: 'https://dp.round1.cc',
    routeSource: 'src/lib/publicRoutes.ts PUBLIC_PATHS',
    output: '/sitemap.xml',
    robotsAdvertised: true,
    notApplicableReason: null,
    verification: ['pnpm check:seo'],
  },
  markdownNegotiation: {
    status: 'enabled',
    paths: ['PUBLIC_PATHS'],
    source: 'local prerendered semantic HTML',
    mediaType: 'text/markdown; charset=utf-8',
    contentLanguage: 'zh-CN',
    contentSignal: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
    notApplicableReason: null,
    verification: ['pnpm test'],
  },
})

test('the Baseline declaration accepts the complete current web-governance contract', () => {
  assert.deepEqual(validateWebGovernancePolicy(COMPLETE_POLICY), [])
})

test('enabled contracts cannot omit their source, verification, or AI policy', () => {
  const incomplete = structuredClone(COMPLETE_POLICY)
  incomplete.modernWebGuidance.queries = []
  incomplete.sitemap.routeSource = ''
  incomplete.markdownNegotiation.verification = []
  incomplete.markdownNegotiation.contentSignal.search = 'no'

  const errors = validateWebGovernancePolicy(incomplete)
  assert.ok(errors.some((error) => error.includes('queries')))
  assert.ok(errors.some((error) => error.includes('routeSource')))
  assert.ok(errors.some((error) => error.includes('verification')))
  assert.ok(errors.some((error) => error.includes('contentSignal')))
})
