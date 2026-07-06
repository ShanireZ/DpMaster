import { useMemo, useState } from 'react'
import { Minus, Plus, Zap, Gauge, X as XIcon } from 'lucide-react'
import './matrix-power.css'

// 2×2 矩阵（斐波那契转移 M = [[1,1],[1,0]]）。所有运算取模，避免大数溢出。
type Mat = [number, number, number, number] // [a,b,c,d] = [[a,b],[c,d]]

const MOD = 1_000_000_007
const FIB_M: Mat = [1, 1, 1, 0]
const IDENT: Mat = [1, 0, 0, 1]

// 模乘：Number 在此规模（<1e9）相乘不超过 2^53，安全。
function mul(x: Mat, y: Mat): Mat {
  return [
    (x[0] * y[0] + x[1] * y[2]) % MOD,
    (x[0] * y[1] + x[1] * y[3]) % MOD,
    (x[2] * y[0] + x[3] * y[2]) % MOD,
    (x[2] * y[1] + x[3] * y[3]) % MOD,
  ]
}

// 一步二进制快速幂的记录：这一位对应的倍增幂 pow=M^(2^bit)，
// 是否因为 n 的该位为 1 而被「累乘」进结果；acc 是累乘后的 Mⁿ 阶段值。
interface Step {
  bit: number // 二进制位下标（0=最低位）
  bitVal: 0 | 1 // n 的该位
  pow: Mat // 当前倍增出的 M^(2^bit)
  used: boolean // 该位为 1 → 累乘进 acc
  acc: Mat // 处理完该位后的累积结果
}

// 生成完整倍增序列与累乘轨迹。核对：M^5 左上=F(6)=8，M^10 左上=F(11)=89。
function fastPowTrace(n: number): { steps: Step[]; result: Mat; bits: number } {
  const steps: Step[] = []
  let pow: Mat = FIB_M // M^(2^0) = M
  let acc: Mat = IDENT // 单位阵起步
  let k = n
  let bit = 0
  if (n === 0) {
    return { steps: [], result: IDENT, bits: 1 }
  }
  while (k > 0) {
    const bitVal = (k & 1) as 0 | 1
    const used = bitVal === 1
    if (used) acc = mul(acc, pow)
    steps.push({ bit, bitVal, pow, used, acc })
    k >>= 1
    if (k > 0) pow = mul(pow, pow) // 平方 → 下一个倍增幂
    bit++
  }
  return { steps, result: acc, bits: steps.length }
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

// 一个 2×2 矩阵的小网格。highlight 决定描边强调色。
function MatCell({ m, tone, cap }: { m: Mat; tone: 'idle' | 'pow' | 'acc'; cap?: string }) {
  return (
    <div className={`mpw__mat mpw__mat--${tone}`}>
      {cap && <div className="mpw__mat-cap">{cap}</div>}
      <div className="mpw__grid">
        {m.map((v, i) => (
          <span key={i} className="mpw__num">
            {v}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * 斐波那契矩阵快速幂 · 二进制倍增可视化（自建轻量，非 DPViz）。
 * 用户改指数 n：把 n 写成二进制，展示倍增平方序列 M, M², M⁴, M⁸ …，
 * 并按 n 的每个为 1 的二进制位把对应幂次「累乘」成 Mⁿ；
 * 每步显示 2×2 数值、当前操作（平方 / 累乘）、以及步数对比（暴力 n 次 vs 快速幂 ~2·⌊log₂n⌋ 次）。
 * 核对：M^5 左上 = F(6) = 8；M^10 左上 = F(11) = 89（F(1)=F(2)=1）。
 */
export default function MatrixPowerDemo() {
  const [n, setN] = useState(5)

  const { steps, result, bits } = useMemo(() => fastPowTrace(n), [n])

  // n 的二进制串（高位在左）。
  const binStr = n.toString(2)
  // 快速幂真实乘法次数：平方 (bits-1) 次 + 累乘（为 1 的位数）次。
  const squarings = Math.max(0, bits - 1)
  const accMuls = steps.filter((s) => s.used).length
  const fastMuls = squarings + accMuls
  // 暴力：连乘 n-1 次（M¹→Mⁿ）。
  const naiveMuls = Math.max(1, n - 1)

  // 结果左上角 = F(n+1)。
  const fibNext = result[0]

  return (
    <div>
      <div className="mpw__toolbar">
        <div>
          <div className="mpw__group-label">指数 n（要算 Mⁿ，即斐波那契第 n+1 项）</div>
          <Stepper label="n" value={n} min={1} max={30} onChange={setN} />
        </div>
        <div className="mpw__bin">
          <div className="mpw__group-label">n 的二进制（低位驱动倍增）</div>
          <div className="mpw__bin-row">
            {binStr.split('').map((b, i) => (
              <span key={i} className={`mpw__bit${b === '1' ? ' on' : ''}`}>
                {b}
              </span>
            ))}
            <span className="mpw__bin-eq">
              = {n}<sub>10</sub>
            </span>
          </div>
        </div>
      </div>

      {/* 倍增 + 累乘轨迹：一行一位，从最低位到最高位 */}
      <div className="mpw__trace">
        <div className="mpw__trace-head">
          <span>
            倍增序列 <span className="mono">M, M², M⁴, M⁸ …</span>：每行处理 n 的一个二进制位（低位在上）
          </span>
          <span className="mono">位为 1 才累乘</span>
        </div>
        <div className="mpw__acc-start">
          <MatCell m={IDENT} tone="acc" cap="起点 acc = I（单位阵）" />
          <span className="mpw__acc-note">从单位阵出发，逐位累乘</span>
        </div>
        {steps.map((s, i) => (
          <div key={i} className={`mpw__step${s.used ? ' used' : ''}`}>
            <div className="mpw__step-bit">
              <span className="mpw__step-power mono">
                M<sup>{1 << s.bit}</sup>
              </span>
              <span className={`mpw__step-flag${s.used ? ' on' : ''}`}>
                位<sub>{s.bit}</sub>={s.bitVal}
              </span>
            </div>
            <MatCell m={s.pow} tone="pow" cap={`M^${1 << s.bit}（平方倍增得到）`} />
            <span className="mpw__op">
              {s.used ? (
                <>
                  <XIcon size={13} /> 累乘
                </>
              ) : (
                <span className="mpw__op-skip">跳过</span>
              )}
            </span>
            <MatCell m={s.acc} tone="acc" cap={s.used ? '累乘后 acc' : 'acc 不变'} />
          </div>
        ))}
      </div>

      {/* 结果 + 读数 */}
      <div className="mpw__result">
        <div className="mpw__result-mat">
          <MatCell m={result} tone="acc" cap={`Mⁿ = M^${n}`} />
          <div className="mpw__result-read">
            <div className="mpw__result-line">
              左上角 = <b className="mono">F({n + 1})</b> = <b className="mono">{fibNext}</b>
            </div>
            <div className="mpw__result-sub">
              斐波那契 F(1)=F(2)=1；Mⁿ 左上恒为 F(n+1)（n=5→F(6)=8，n=10→F(11)=89）。
            </div>
          </div>
        </div>
      </div>

      <div className="mpw__compare">
        <div className="mpw__card">
          <div className="mpw__card-head">
            <Gauge size={15} /> 暴力：连乘 M
          </div>
          <div className="mpw__card-val">
            {naiveMuls}
            <small>次乘法</small>
          </div>
          <div className="mpw__card-sub">M¹→Mⁿ 逐个乘，共 n−1 次 · O(n)</div>
        </div>
        <div className="mpw__card win">
          <div className="mpw__card-head">
            <Zap size={15} /> 快速幂：倍增
          </div>
          <div className="mpw__card-val">
            {fastMuls}
            <small>次乘法</small>
          </div>
          <div className="mpw__card-sub">
            平方 {squarings} + 累乘 {accMuls} · O(log n)
          </div>
        </div>
      </div>

      <div className="mpw__delta">
        n={n} 时，暴力要做 <b>{naiveMuls}</b> 次矩阵乘法，快速幂只用 <b>{fastMuls}</b> 次——
        把线性的 <span className="mono">O(n)</span> 压成对数的 <span className="mono">O(log n)</span>。
        真正题目里 n 可达 <span className="mono">2⁶³</span>，暴力 <span className="mono">O(n)</span> 必然超时，
        快速幂却只需约 <b>{Math.ceil(Math.log2(Math.max(2, n)))}</b> 层倍增即可。
      </div>
    </div>
  )
}
