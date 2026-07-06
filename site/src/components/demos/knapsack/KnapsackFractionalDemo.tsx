import { useMemo, useState } from 'react'
import { Minus, Plus, X, Scissors, Boxes } from 'lucide-react'
import './fractional-demo.css'

interface Item {
  w: number
  v: number
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="stepper__lab">{label}</div>
      <div className="stepper__row">
        <button onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label} 减`}>
          <Minus size={13} />
        </button>
        <span className="stepper__val">{value}</span>
        <button onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`${label} 加`}>
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}

// 四舍五入到最多 2 位小数、去掉多余的 0（10.75 / 9 / 7.5）。
const fmt = (x: number) => {
  const r = Math.round(x * 100) / 100
  return Number.isInteger(r) ? String(r) : String(r)
}

interface Seg {
  kind: 'full' | 'cut' | 'empty'
  span: number // 占容量的格数（可为小数）
  text: string
}

// 贪心（可分割）：按 v/w 降序装，最后一件按剩余容量比例切开。
function greedyFractional(items: Item[], cap: number): { value: number; segs: Seg[] } {
  const order = [...items].sort((a, b) => b.v / b.w - a.v / a.w)
  let rest = cap
  let value = 0
  const segs: Seg[] = []
  for (const it of order) {
    if (rest <= 0) break
    if (rest >= it.w) {
      // 整件装入
      value += it.v
      rest -= it.w
      segs.push({ kind: 'full', span: it.w, text: `w=${it.w} v=${it.v}` })
    } else {
      // 只装得下一部分 → 切开
      const frac = rest / it.w
      value += it.v * frac
      segs.push({
        kind: 'cut',
        span: rest,
        text: `切 ${fmt(frac * 100)}%`,
      })
      rest = 0
    }
  }
  if (rest > 0) segs.push({ kind: 'empty', span: rest, text: rest === cap ? '空' : '空余' })
  return { value, segs }
}

// 整取 01 背包（不可分割）最优价值——自写小背包作对照。
function best01(items: Item[], cap: number): number {
  const f = new Array(cap + 1).fill(0)
  for (const it of items) {
    for (let j = cap; j >= it.w; j--) {
      f[j] = Math.max(f[j], f[j - it.w] + it.v)
    }
  }
  return f[cap]
}

/**
 * 分数背包（辨析课）自建轻量可视化：
 * 贪心按 v/w 降序把整段填进容量条、最后一件切开（斜纹）；
 * 旁边并列只读的「整取 01-DP 最优」，凸显可分割时贪心 ≥ 整取且 O(n log n) 更简单。
 */
export default function KnapsackFractionalDemo() {
  const [items, setItems] = useState<Item[]>([
    { w: 2, v: 3 },
    { w: 3, v: 4 },
    { w: 4, v: 5 },
  ])
  const [cap, setCap] = useState(8)

  const greedy = useMemo(() => greedyFractional(items, cap), [items, cap])
  const dp = useMemo(() => best01(items, cap), [items, cap])

  const setItem = (i: number, patch: Partial<Item>) =>
    setItems((arr) => arr.map((it, k) => (k === i ? { ...it, ...patch } : it)))

  const delta = greedy.value - dp

  // 刻度：0..cap
  const ticks = Array.from({ length: cap + 1 }, (_, k) => k)

  return (
    <div>
      <div className="frd__toolbar">
        <div>
          <div className="frd__group-label">物品（可分割 · 可改重量 / 价值）</div>
          <div className="frd__items">
            {items.map((it, i) => (
              <div className="frd__item" key={i}>
                <span className="frd__item-i">{i + 1}</span>
                {items.length > 1 && (
                  <button className="frd__remove" onClick={() => setItems((a) => a.filter((_, k) => k !== i))} aria-label="删除物品">
                    <X size={12} />
                  </button>
                )}
                <Stepper label="重量 w" value={it.w} min={1} max={cap} onChange={(w) => setItem(i, { w })} />
                <Stepper label="价值 v" value={it.v} min={1} max={30} onChange={(v) => setItem(i, { v })} />
                <span className="frd__ratio">v/w={fmt(it.v / it.w)}</span>
              </div>
            ))}
            {items.length < 5 && (
              <button className="frd__add" onClick={() => setItems((a) => [...a, { w: 3, v: 4 }])}>
                <Plus size={15} /> 加物品
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="frd__group-label">背包容量 C</div>
          <Stepper label="C" value={cap} min={2} max={16} onChange={setCap} />
        </div>
      </div>

      <div className="frd__stage">
        <div className="frd__stage-label">
          <span>
            贪心装填：按 <span className="mono">v/w</span> 从高到低填，最后一件切开填满
          </span>
          <span className="mono">已排序</span>
        </div>
        <div className="frd__bar">
          {greedy.segs.map((s, i) => (
            <div
              key={i}
              className={`frd__seg ${s.kind}`}
              style={{ flexGrow: s.span, flexBasis: 0 }}
              title={s.text}
            >
              <span className="frd__seg-txt">{s.text}</span>
            </div>
          ))}
        </div>
        <div className="frd__ticks">
          {ticks.map((t) => (
            <span key={t} className="frd__tick" style={{ left: `${(t / cap) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="frd__compare">
        <div className="frd__card win">
          <div className="frd__card-head">
            <Scissors size={15} /> 可分割 · 贪心（本页）
          </div>
          <div className="frd__card-val">{fmt(greedy.value)}</div>
          <div className="frd__card-sub">按 v/w 降序、最后一件切开 · O(n log n)</div>
        </div>
        <div className="frd__card">
          <div className="frd__card-head">
            <Boxes size={15} /> 若整取 · 01-DP 最优
          </div>
          <div className="frd__card-val">{fmt(dp)}</div>
          <div className="frd__card-sub">每件整取或不取 · 需要背包 DP</div>
        </div>
      </div>

      <div className="frd__delta">
        {delta > 1e-9 ? (
          <>
            可切分时，贪心多拿到 <b>+{fmt(delta)}</b>：把最值钱的那件切一部分塞满了整取时留下的缝隙。
          </>
        ) : (
          <>
            这组数据恰好整取就能填满，两者持平（贪心永远 <b>≥</b> 整取，绝不会更差）。
          </>
        )}
      </div>
    </div>
  )
}
