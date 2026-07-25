import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useLocation, useOutlet } from 'react-router-dom'

const routeEase = [0.16, 1, 0.3, 1] as const

export default function RouteStage() {
  const location = useLocation()
  const outlet = useOutlet()
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        className="route-stage"
        key={location.pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.34, ease: routeEase }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
