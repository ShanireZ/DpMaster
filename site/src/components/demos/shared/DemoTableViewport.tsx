import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

export interface DemoTableViewportProps {
  label: string
  children: ReactNode
  overviewLabel?: string
  className?: string
}

export function DemoTableViewport({
  label,
  children,
  overviewLabel = '表格横向位置',
  className = '',
}: DemoTableViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(0)
  const [canScrollStart, setCanScrollStart] = useState(false)
  const [canScrollEnd, setCanScrollEnd] = useState(false)

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
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
          style={{ translate: `${position * 100}% 0` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
