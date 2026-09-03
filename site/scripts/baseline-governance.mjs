const FOUNDATION_GUIDES = Object.freeze([
  'accessibility',
  'html',
  'css',
  'forms',
  'performance',
  'security',
  'privacy',
])

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasTextList(value) {
  return Array.isArray(value) && value.length > 0 && value.every(hasText)
}

export function validateWebGovernancePolicy(policy) {
  const errors = []
  const modern = policy?.modernWebGuidance
  if (modern?.status !== 'required') errors.push('modernWebGuidance.status must be required')
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(modern?.reviewedAt ?? '')) {
    errors.push('modernWebGuidance.reviewedAt must be an ISO date')
  }
  if (!/^\d{4}_\d{2}_\d{2}-[0-9a-f]+$/u.test(modern?.skillVersion ?? '')) {
    errors.push('modernWebGuidance.skillVersion must record the used skill version')
  }
  if (
    !Array.isArray(modern?.foundationGuides)
    || FOUNDATION_GUIDES.some((guide) => !modern.foundationGuides.includes(guide))
  ) {
    errors.push('modernWebGuidance.foundationGuides must include the seven foundation guides')
  }
  if (
    !Array.isArray(modern?.queries)
    || modern.queries.length === 0
    || modern.queries.some((entry) => (
      !hasText(entry?.query) || !hasTextList(entry?.guideIds) || !hasTextList(entry?.scope)
    ))
  ) {
    errors.push('modernWebGuidance.queries must record actionable queries, guideIds, and scope')
  }
  if (!hasTextList(modern?.applicablePaths)) {
    errors.push('modernWebGuidance.applicablePaths must identify browser-facing scope')
  }
  if (!Array.isArray(modern?.deviations)) {
    errors.push('modernWebGuidance.deviations must be an array')
  }
  if (!hasTextList(modern?.verification)) {
    errors.push('modernWebGuidance.verification must name executable checks')
  }

  const sitemap = policy?.sitemap
  if (sitemap?.status !== 'enabled') errors.push('sitemap.status must be enabled')
  if (!hasText(sitemap?.canonicalOrigin)) errors.push('sitemap.canonicalOrigin is required')
  if (!hasText(sitemap?.routeSource)) errors.push('sitemap.routeSource is required')
  if (sitemap?.output !== '/sitemap.xml') errors.push('sitemap.output must be /sitemap.xml')
  if (sitemap?.robotsAdvertised !== true) errors.push('sitemap.robotsAdvertised must be true')
  if (sitemap?.notApplicableReason !== null) errors.push('enabled sitemap must have a null notApplicableReason')
  if (!hasTextList(sitemap?.verification)) errors.push('sitemap.verification must name executable checks')

  const markdown = policy?.markdownNegotiation
  if (markdown?.status !== 'enabled') errors.push('markdownNegotiation.status must be enabled')
  if (!hasTextList(markdown?.paths)) errors.push('markdownNegotiation.paths must identify enabled routes')
  if (!hasText(markdown?.source)) errors.push('markdownNegotiation.source is required')
  if (markdown?.mediaType !== 'text/markdown; charset=utf-8') {
    errors.push('markdownNegotiation.mediaType must use the registered Markdown media type')
  }
  if (markdown?.contentLanguage !== 'zh-CN') {
    errors.push('markdownNegotiation.contentLanguage must be zh-CN')
  }
  if (
    markdown?.contentSignal?.search !== 'yes'
    || markdown?.contentSignal?.['ai-train'] !== 'no'
    || markdown?.contentSignal?.['ai-input'] !== 'yes'
  ) {
    errors.push(
      'markdownNegotiation.contentSignal must match the edge policy: search and ai-input allowed, ai-train refused',
    )
  }
  if (markdown?.notApplicableReason !== null) {
    errors.push('enabled Markdown negotiation must have a null notApplicableReason')
  }
  if (!hasTextList(markdown?.verification)) {
    errors.push('markdownNegotiation.verification must name executable checks')
  }

  return errors
}
