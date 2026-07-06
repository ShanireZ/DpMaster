import { useMemo, useState } from 'react'
import { Minus, Plus, Layers, Boxes } from 'lucide-react'
import { binarySplit, packCounts } from './multipleSolver'
import './multiple-split.css'

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

/**
 * 多重背包 · 二进制拆包可视化（自建轻量，非 DPViz）。
 * 拖动件数上限 m：实时看它拆成 1,2,4,…,余r 这些「打包件」，
 * 段宽 ∝ 该包件数；下方 0…m 覆盖带示意任选若干包相加恰好覆盖每一个件数；
 * 读数条对比「朴素需 m 个 vs 二进制需 ⌈log⌉ 个」。
 * binarySplit / packCounts 复用自 multipleSolver（只读，不改）。
 */
export default function MultipleSplitDemo() {
  const [m, setM] = useState(13)

  // 复用纯函数：单个物品（w=1,v=1 仅用于取包的件数拆分，件数才是重点）。
  const packs = useMemo(() => binarySplit([{ w: 1, v: 1, m }]), [m])
  const counts = useMemo(() => packCounts([{ w: 1, v: 1, m }]), [m])

  // 覆盖带 0…m 全部件数（子集和可凑出其中每一个）。
  const covered = Array.from({ length: m + 1 }, (_, k) => k)

  // 拆分算式文本：1 + 2 + 4 + 余r = m
  const sumExpr = packs.map((p) => p.cnt).join(' + ') + ` = ${m}`
  const powCount = packs.filter((p) => !p.label.startsWith('×余')).length
  const hasRem = packs.some((p) => p.label.startsWith('×余'))

  return (
    <div>
      <div className="msp__toolbar">
        <div>
          <div className="msp__group-label">件数上限 m（这一种物品有几件）</div>
          <Stepper label="m" value={m} min={1} max={20} onChange={setM} />
        </div>
        <div className="msp__hint">
          拆出 <b>{powCount}</b> 个 2 的幂包
          {hasRem ? (
            <>
              {' '}
              + <b>1</b> 个余数包
            </>
          ) : (
            <>（恰好凑满，无需余数包）</>
          )}
          ，共 <b>{counts.binary}</b> 包。
        </div>
      </div>

      {/* ① 打包件条：段宽 ∝ 件数 */}
      <div className="msp__stage">
        <div className="msp__stage-label">
          <span>
            二进制拆包：<span className="mono">{sumExpr}</span>（段宽 ∝ 该包件数）
          </span>
          <span className="mono">1,2,4,… + 余r</span>
        </div>
        <div className="msp__packbar">
          {packs.map((p, i) => {
            const isRem = p.label.startsWith('×余')
            return (
              <div
                key={i}
                className={`msp__pack${isRem ? ' rem' : ''}`}
                style={{ flexGrow: p.cnt, flexBasis: 0 }}
                title={`${p.label}：含 ${p.cnt} 件原物`}
              >
                <span className="msp__pack-lab">{p.label}</span>
                <span className="msp__pack-sub">{p.cnt} 件</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ② 覆盖带：0…m 每一件数都能被某个子集和凑出 */}
      <div>
        <div className="msp__cover-label">
          <span>
            这些包任选若干相加，恰好覆盖 <span className="mono">0…{m}</span> 的每一个件数
          </span>
          <span className="mono">
            {m + 1} 个，全可达
          </span>
        </div>
        <div className="msp__cover">
          {covered.map((k) => (
            <span key={k} className={`msp__cell${k === 0 ? ' zero' : ''}`} title={`可凑出 ${k} 件`}>
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* ③ 读数：朴素 m 个 vs 二进制 log 个 */}
      <div className="msp__compare" style={{ marginTop: 'var(--sp-5)' }}>
        <div className="msp__card">
          <div className="msp__card-head">
            <Boxes size={15} /> 朴素：一件一件摊开
          </div>
          <div className="msp__card-val">
            {counts.naive}
            <small>个物品</small>
          </div>
          <div className="msp__card-sub">Σm · 每件做一次 01 逆推</div>
        </div>
        <div className="msp__card win">
          <div className="msp__card-head">
            <Layers size={15} /> 二进制：打包
          </div>
          <div className="msp__card-val">
            {counts.binary}
            <small>个打包件</small>
          </div>
          <div className="msp__card-sub">⌈log₂(m+1)⌉ · 每包做一次 01 逆推</div>
        </div>
      </div>

      <div className="msp__delta">
        m={m} 时，朴素要 <b>{counts.naive}</b> 个物品，二进制只用 <b>{counts.binary}</b> 个打包件——
        少做 <b>{counts.naive - counts.binary}</b> 次 01 转移，却依旧能凑出「取 0…{m} 件」的每一种，
        既不重复、也不遗漏。m 越大，这道差距越悬殊。
      </div>
    </div>
  )
}
