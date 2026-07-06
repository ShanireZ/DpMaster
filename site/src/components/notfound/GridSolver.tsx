import { useEffect, useRef } from 'react'

/**
 * 404 中景层 · Canvas 2D 的 DP 叙事。
 * 一张 DP 表：填表波沿对角线（无后效性顺序）逐格点亮，一条「最优路径」抢先冲向
 * 画面中央的断层；越过断层边缘时路径断裂、红叉标记、碎片四散——隐喻「无法到达的状态」。
 * 指针经过会激起青色涟漪（重新计算的转移）。配色全部取自 tokens 的 --viz-* 语义色。
 * prefers-reduced-motion 只渲一帧静止残局；离屏暂停。replayKey 变化即重挂载重播。
 */
export default function GridSolver({ replayKey }: { replayKey: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const css = getComputedStyle(document.documentElement)
    const tok = (n: string, f: string) => css.getPropertyValue(n).trim() || f
    const C = {
      cell2: tok('--viz-cell-2', '#201b17'),
      settled: tok('--viz-settled', '#57524b'),
      current: tok('--viz-current', '#ef9f5e'),
      source: tok('--viz-source', '#6fb6c6'),
      chosen: tok('--viz-chosen', '#93c06b'),
      invalid: tok('--viz-invalid', '#e07e7e'),
      border: tok('--border-strong', 'rgba(240,234,225,0.16)'),
    }

    let W = 0, H = 0, cell = 46, cols = 0, rows = 0, vTop = 0, vBot = 0
    let path: { x: number; y: number }[] = []
    const build = () => {
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cell = W < 640 ? 30 : W < 1024 ? 38 : 46
      cols = Math.ceil(W / cell) + 1
      rows = Math.ceil(H / cell) + 1
      vTop = Math.floor(rows * 0.42)
      vBot = Math.ceil(rows * 0.58)
      path = [{ x: 0, y: 0 }]
      let x = 0, y = 0
      const target = Math.max(2, Math.floor(cols * 0.46))
      while (y < vTop) {
        if (x < target && (x + y) % 3 !== 0) x++
        else y++
        path.push({ x, y })
      }
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(canvas)

    const isVoid = (j: number) => j >= vTop && j < vBot

    const mouse = { i: -99, j: -99, t: -1 }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.i = Math.floor((e.clientX - r.left) / cell)
      mouse.j = Math.floor((e.clientY - r.top) / cell)
      mouse.t = performance.now()
    }
    window.addEventListener('pointermove', onMove)

    interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number }
    let parts: Particle[] = []
    const spawn = (cx: number, cy: number) => {
      for (let k = 0; k < 36; k++) {
        const a = Math.random() * Math.PI * 2
        const sp = 40 + Math.random() * 170
        parts.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: 0, max: 0.7 + Math.random() * 0.8 })
      }
    }

    const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, alpha: number) => {
      ctx.strokeStyle = color
      ctx.globalAlpha = alpha
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      const ang = Math.atan2(y2 - y1, x2 - x1)
      const h = 5
      ctx.beginPath()
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - h * Math.cos(ang - 0.5), y2 - h * Math.sin(ang - 0.5))
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - h * Math.cos(ang + 0.5), y2 - h * Math.sin(ang + 0.5))
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    const CYCLE = 6.4, BREAK = 3.7
    let start = performance.now(), last = start, raf = 0, running = true
    let lastCycle = 0, burst = false

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const elapsed = (now - start) / 1000
      const cycle = reduce ? BREAK + 0.4 : elapsed % CYCLE
      if (cycle < lastCycle) {
        burst = false
        parts = []
      }
      lastCycle = cycle
      const prog = Math.min(cycle, BREAK) / BREAK
      const front = prog * (cols + vTop + 2)
      const pathLen = path.length
      const s = cell - 3

      ctx.clearRect(0, 0, W, H)

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * cell + 1.5, y = j * cell + 1.5
          if (isVoid(j)) {
            const d = (j - vTop) / Math.max(1, vBot - vTop)
            ctx.fillStyle = '#000'
            ctx.globalAlpha = 0.34 * (1 - Math.abs(d - 0.5) * 1.4)
            ctx.fillRect(x, y, s, s)
            ctx.globalAlpha = 1
            continue
          }
          ctx.fillStyle = C.cell2
          ctx.globalAlpha = 0.45
          ctx.fillRect(x, y, s, s)
          ctx.strokeStyle = C.border
          ctx.globalAlpha = 0.5
          ctx.lineWidth = 1
          ctx.strokeRect(x, y, s, s)
          ctx.globalAlpha = 1
          const diag = i + j
          if (diag < front - 1.6) {
            ctx.fillStyle = C.settled
            ctx.globalAlpha = 0.2
            ctx.fillRect(x, y, s, s)
            ctx.globalAlpha = 1
          }
          const band = front - diag
          if (band >= 0 && band < 1.8) {
            ctx.fillStyle = C.current
            ctx.globalAlpha = 0.55 * (1 - band / 1.8)
            ctx.fillRect(x, y, s, s)
            ctx.globalAlpha = 1
          }
          if (mouse.t > 0) {
            const dtm = (now - mouse.t) / 1000
            if (dtm < 1.1) {
              const dd = Math.hypot(i - mouse.i, j - mouse.j)
              if (Math.abs(dd - dtm * 9) < 1.0) {
                ctx.fillStyle = C.source
                ctx.globalAlpha = 0.45 * (1 - dtm / 1.1)
                ctx.fillRect(x, y, s, s)
                ctx.globalAlpha = 1
              }
            }
          }
        }
      }

      // 最优路径（chosen 绿）
      const shown = Math.max(1, Math.min(pathLen, Math.floor(front)))
      ctx.strokeStyle = C.chosen
      ctx.lineWidth = 3
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.globalAlpha = 0.92
      ctx.beginPath()
      for (let k = 0; k < shown; k++) {
        const px = path[k].x * cell + cell / 2, py = path[k].y * cell + cell / 2
        if (k === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()
      ctx.globalAlpha = 1

      // 转移箭头（source 青）
      for (let k = 2; k < shown - 1; k += 3) {
        const a = path[k], b = path[k + 1]
        arrow(a.x * cell + cell / 2, a.y * cell + cell / 2, b.x * cell + cell / 2, b.y * cell + cell / 2, C.source, 0.5)
      }

      // 路径头（current 珊瑚辉光）
      if (shown >= 1 && front < pathLen) {
        const hd = path[shown - 1]
        const hx = hd.x * cell + cell / 2, hy = hd.y * cell + cell / 2
        ctx.fillStyle = C.current
        ctx.shadowColor = C.current
        ctx.shadowBlur = 18
        ctx.beginPath()
        ctx.arc(hx, hy, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // 断层处断裂：红叉 + 碎片
      const end = path[pathLen - 1]
      const ex = end.x * cell + cell / 2, ey = end.y * cell + cell / 2
      if (front >= pathLen && !burst && !reduce) {
        spawn(ex, ey)
        burst = true
      }
      if (front >= pathLen) {
        ctx.strokeStyle = C.invalid
        ctx.globalAlpha = 0.9
        ctx.lineWidth = 2.5
        const r = 8
        ctx.beginPath()
        ctx.moveTo(ex - r, ey - r)
        ctx.lineTo(ex + r, ey + r)
        ctx.moveTo(ex + r, ey - r)
        ctx.lineTo(ex - r, ey + r)
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      parts.forEach((p) => {
        p.life += dt
        p.vy += 220 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        ctx.fillStyle = C.invalid
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.max)
        ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3)
      })
      ctx.globalAlpha = 1
      parts = parts.filter((p) => p.life < p.max)

      if (running && !reduce) raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    const onVis = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!reduce) {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
    }
  }, [replayKey])

  return <canvas ref={ref} className="nf__grid" aria-hidden="true" />
}
