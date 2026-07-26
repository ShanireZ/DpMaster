import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useLocation, useOutlet } from 'react-router-dom'

const routeEase = [0.16, 1, 0.3, 1] as const

export default function RouteStage() {
  const location = useLocation()
  const outlet = useOutlet()
  const reduceMotion = useReducedMotion()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <motion.div
      className="route-stage"
      key={location.pathname}
      initial={reduceMotion || !hasMounted ? false : { opacity: 0.94 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: routeEase }}
    >
      {outlet}
    </motion.div>
  )
}
