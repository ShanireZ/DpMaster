import type { PointerEvent, ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'

type MagnetProps = {
  children: ReactNode
  className?: string
  strength?: number
}

/**
 * Adapted from the React Bits Magnet interaction pattern.
 * Motion values keep pointer updates outside React's render cycle.
 */
export default function Magnet({ children, className, strength = 0.2 }: MagnetProps) {
  const reduceMotion = useReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 360, damping: 26, mass: 0.45 })
  const y = useSpring(rawY, { stiffness: 360, damping: 26, mass: 0.45 })

  const reset = () => {
    rawX.set(0)
    rawY.set(0)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse') return

    const bounds = event.currentTarget.getBoundingClientRect()
    rawX.set((event.clientX - (bounds.left + bounds.width / 2)) * strength)
    rawY.set((event.clientY - (bounds.top + bounds.height / 2)) * strength)
  }

  return (
    <div
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <motion.div
        className="react-bits-magnet__body"
        style={reduceMotion ? undefined : { x, y }}
      >
        {children}
      </motion.div>
    </div>
  )
}
