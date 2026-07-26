import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

type AnimatedContentProps = {
  children: ReactNode
  className?: string
  delay?: number
  distance?: number
  direction?: 'horizontal' | 'vertical'
}

/**
 * Adapted from the React Bits Animated Content interaction pattern.
 * It reveals structural content once, while reduced-motion users get an instant render.
 */
export default function AnimatedContent({
  children,
  className,
  delay = 0,
  distance = 10,
  direction = 'vertical',
}: AnimatedContentProps) {
  const reduceMotion = useReducedMotion()
  const offset = reduceMotion ? 0 : distance
  const initial = direction === 'horizontal'
    ? { opacity: reduceMotion ? 1 : 0, x: offset }
    : { opacity: reduceMotion ? 1 : 0, y: offset }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.42, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
