const DEFAULT_ANCHOR_GAP = 24

function hashTarget(hash: string): HTMLElement | null {
  if (!hash || hash === '#') return null
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)))
  } catch {
    return null
  }
}

function anchorOffset(target: HTMLElement): number {
  const declaredMargin = Number.parseFloat(getComputedStyle(target).scrollMarginTop)
  if (Number.isFinite(declaredMargin) && declaredMargin > 0) return declaredMargin

  const topbarHeight = document.querySelector<HTMLElement>('.topbar')
    ?.getBoundingClientRect().height ?? 0
  const tokenGap = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--sp-5'),
  )
  return topbarHeight + (Number.isFinite(tokenGap) ? tokenGap : DEFAULT_ANCHOR_GAP)
}

type HashScrollBehavior = ScrollBehavior | 'instant'

export function scrollToHashTarget(
  hash: string,
  behavior: HashScrollBehavior = 'instant',
): boolean {
  const target = hashTarget(hash)
  if (!target) return false

  const top = target.getBoundingClientRect().top + window.scrollY - anchorOffset(target)
  window.scrollTo({
    top: Math.max(0, top),
    left: window.scrollX,
    behavior: behavior as ScrollBehavior,
  })
  return true
}

export function scheduleHashScroll(
  hash: string,
  behavior: HashScrollBehavior = 'instant',
): () => void {
  const resolvedBehavior = behavior === 'smooth'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'instant'
    : behavior
  let secondFrame = 0
  let cancelled = false
  const timers: number[] = []
  const cancelOnInput = () => cancel()
  const inputEvents = ['keydown', 'pointerdown', 'touchstart', 'wheel'] as const

  const removeInputListeners = () => {
    for (const eventName of inputEvents) window.removeEventListener(eventName, cancelOnInput)
  }

  const correctPosition = () => {
    if (cancelled || hashTarget(window.location.hash) !== hashTarget(hash)) return
    scrollToHashTarget(hash, 'instant')
  }

  const firstFrame = window.requestAnimationFrame(() => {
    secondFrame = window.requestAnimationFrame(() => scrollToHashTarget(hash, resolvedBehavior))
  })
  const correctionDelays = resolvedBehavior === 'smooth' ? [650, 1_400] : [120, 500]
  correctionDelays.forEach((delay, index) => {
    timers.push(window.setTimeout(() => {
      correctPosition()
      if (index === correctionDelays.length - 1) removeInputListeners()
    }, delay))
  })
  for (const eventName of inputEvents) {
    window.addEventListener(eventName, cancelOnInput, { passive: true })
  }

  function cancel() {
    if (cancelled) return
    cancelled = true
    window.cancelAnimationFrame(firstFrame)
    if (secondFrame) window.cancelAnimationFrame(secondFrame)
    timers.forEach((timer) => window.clearTimeout(timer))
    removeInputListeners()
  }

  return cancel
}
