import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Gamepad2 } from 'lucide-react'
import './deferred-game.css'

export function DeferredGame({ children, label }: { children: ReactNode; label: string }) {
  const [ready, setReady] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ready || typeof window === 'undefined') return
    if (!('IntersectionObserver' in window)) {
      setReady(true)
      return
    }

    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setReady(true)
        observer.disconnect()
      },
      { rootMargin: '400px 0px', threshold: 0.01 },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [ready])

  return (
    <div ref={rootRef} className="deferred-game" aria-label={label} aria-busy={!ready}>
      {ready ? (
        children
      ) : (
        <div className="deferred-game__placeholder" role="status">
          <Gamepad2 size={24} aria-hidden="true" />
          <span>互动游戏将在接近时自动加载</span>
        </div>
      )}
    </div>
  )
}
