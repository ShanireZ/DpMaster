import { useMemo, useState } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { tspHamilton } from './tspSolver'
import '../knapsack/knapsack-demo.css'
import './bitmask-demo.css'

interface Pt {
  x: number
  y: number
}

// 初始点：点 0 固定为起点，其余散开。坐标用小整数便于手算距离。
const INIT: Pt[] = [
  { x: 1, y: 1 },
  { x: 5, y: 2 },
  { x: 4, y: 6 },
  { x: 1, y: 5 },
]

// 曼哈顿距离——整数、可心算，契合「跟着算一遍」。
function distMat(pts: Pt[]): number[][] {
  const n = pts.length
  const d = Array.from({ length: n }, () => Array<number>(n).fill(0))
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) d[i][j] = Math.abs(pts[i].x - pts[j].x) + Math.abs(pts[i].y - pts[j].y)
  return d
}

export default function TspDemo() {
  const [pts, setPts] = useState<Pt[]>(INIT)
  const n = pts.length

  const dist = useMemo(() => distMat(pts), [pts])
  const model = useMemo(() => tspHamilton(n, dist), [n, dist])
  const modelKey = `tsp-${pts.map((p) => `${p.x}.${p.y}`).join('_')}`

  const move = (i: number, dx: number, dy: number) =>
    setPts((arr) =>
      arr.map((p, k) =>
        k === i ? { x: Math.max(0, Math.min(7, p.x + dx)), y: Math.max(0, Math.min(7, p.y + dy)) } : p,
      ),
    )
  const addPt = () => setPts((arr) => (arr.length < 5 ? [...arr, { x: 3, y: 3 }] : arr))
  const removePt = () => setPts((arr) => (arr.length > 3 ? arr.slice(0, -1) : arr))

  // 小地图布局
  const S = 30
  const pad = 18
  const mapW = 7 * S + pad * 2
  const px = (x: number) => pad + x * S
  const py = (y: number) => pad + (7 - y) * S // y 向上

  return (
    <div>
      <div className="bm__toolbar">
        <div className="bm__map-wrap">
          <div className="kd__group-label">点位（点 0 = 起点 · 可移动 · 曼哈顿距离）</div>
          <svg className="bm__map" viewBox={`0 0 ${mapW} ${mapW}`} role="img" aria-label="TSP 点位小地图">
            {Array.from({ length: 8 }, (_, g) => (
              <g key={g}>
                <line x1={px(g)} y1={py(0)} x2={px(g)} y2={py(7)} stroke="var(--border)" strokeWidth="1" />
                <line x1={px(0)} y1={py(g)} x2={px(7)} y2={py(g)} stroke="var(--border)" strokeWidth="1" />
              </g>
            ))}
            {pts.map((p, i) => (
              <g key={i} transform={`translate(${px(p.x)},${py(p.y)})`}>
                <circle
                  r="13"
                  fill={i === 0 ? 'var(--grad-accent)' : 'color-mix(in srgb, var(--accent-1) 20%, var(--surface-3))'}
                  stroke="var(--accent-2)"
                  strokeWidth="1.6"
                />
                <text y="4" textAnchor="middle" fontSize="12" fontWeight="700" fill={i === 0 ? 'var(--text-on-accent)' : 'var(--text-1)'}>
                  {i}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="bm__controls">
          <div className="kd__group-label">移动每个点</div>
          <div className="bm__movers">
            {pts.map((p, i) => (
              <div className="bm__mover" key={i}>
                <span className="bm__mover-id">{i}</span>
                <div className="bm__pad">
                  <button onClick={() => move(i, 0, 1)} aria-label={`点${i}上移`}>↑</button>
                  <div className="bm__pad-mid">
                    <button onClick={() => move(i, -1, 0)} aria-label={`点${i}左移`}>←</button>
                    <span className="bm__coord">
                      {p.x},{p.y}
                    </span>
                    <button onClick={() => move(i, 1, 0)} aria-label={`点${i}右移`}>→</button>
                  </div>
                  <button onClick={() => move(i, 0, -1)} aria-label={`点${i}下移`}>↓</button>
                </div>
              </div>
            ))}
          </div>
          <div className="bm__count">
            <span className="kd__group-label" style={{ margin: 0 }}>点数 {n}</span>
            <button onClick={removePt} disabled={n <= 3} aria-label="减少点">
              <Minus size={13} />
            </button>
            <button onClick={addPt} disabled={n >= 5} aria-label="增加点">
              <Plus size={13} />
            </button>
            <button className="bm__reset" onClick={() => setPts(INIT)} aria-label="重置点位">
              <RotateCcw size={13} /> 复位
            </button>
          </div>
        </div>
      </div>

      <div className="bm__note">
        行 = 已访问集合 mask（二进制，共 <b>2^{n}</b> 行）；列 = 当前停留的点。看它如何从起点 <code>0001</code> 逐步点亮，最后一行取最小即答案。
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
