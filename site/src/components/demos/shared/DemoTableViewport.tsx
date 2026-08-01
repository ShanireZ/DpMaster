import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

export interface DemoTableFocus {
  key: number | string
  start: number
  size: number
}

export interface DemoTableViewportProps {
  label: string
  children: ReactNode
  overviewLabel?: string
  className?: string
  focus?: DemoTableFocus | null
}

export function DemoTableViewport({
  label,
  children,
  overviewLabel = '表格横向位置',
  className = '',
  focus = null,
}: DemoTableViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(0)
  const [visibleRatio, setVisibleRatio] = useState(1)
  const [canScrollStart, setCanScrollStart] = useState(false)
  const [canScrollEnd, setCanScrollEnd] = useState(false)
  const focusKey = focus?.key
  const focusStart = focus?.start
  const focusSize = focus?.size

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
    setVisibleRatio(viewport.scrollWidth === 0 ? 1 : Math.min(1, viewport.clientWidth / viewport.scrollWidth))
    setPosition(maximum === 0 ? 0 : viewport.scrollLeft / maximum)
    setCanScrollStart(viewport.scrollLeft > 1)
    setCanScrollEnd(viewport.scrollLeft < maximum - 1)
  }, [])

  useEffect(() => {
    updateScrollState()
    const viewport = viewportRef.current
    if (!viewport) return
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(viewport)
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild)
    return () => observer.disconnect()
  }, [updateScrollState])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || focusStart === undefined || focusSize === undefined) return

    const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
    const margin = Math.min(32, viewport.clientWidth * 0.12)
    const visibleStart = viewport.scrollLeft + margin
    const visibleEnd = viewport.scrollLeft + viewport.clientWidth - margin
    const focusEnd = focusStart + focusSize
    let nextLeft = viewport.scrollLeft

    if (focusStart < visibleStart) nextLeft = focusStart - margin
    else if (focusEnd > visibleEnd) nextLeft = focusEnd - viewport.clientWidth + margin

    nextLeft = Math.max(0, Math.min(maximum, nextLeft))
    if (Math.abs(nextLeft - viewport.scrollLeft) > 1) viewport.scrollTo({ left: nextLeft, behavior: 'auto' })
    updateScrollState()
  }, [focusKey, focusSize, focusStart, updateScrollState])

  return (
    <div
      className={`demo-table-viewport${className ? ` ${className}` : ''}`}
      data-can-scroll-start={canScrollStart ? 'true' : 'false'}
      data-can-scroll-end={canScrollEnd ? 'true' : 'false'}
    >
      <div
        ref={viewportRef}
        className="demo-table-viewport__scroller"
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={updateScrollState}
      >
        {children}
      </div>
      <div className="demo-table-viewport__overview" aria-label={overviewLabel}>
        <span
          className="demo-table-viewport__position"
          style={{
            left: `${position * (1 - visibleRatio) * 100}%`,
            width: `${visibleRatio * 100}%`,
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
