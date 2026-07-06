import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { scoreTree } from './scoreTreeSolver'
import '../knapsack/knapsack-demo.css'

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
 * 加分二叉树区间 DP 三角表演示：dp[i][j] 按区间长度递推，
 * 逐格高亮被选中的根 k 与它的左、右子树来源 dp[i][k-1]、dp[k+1][j]。
 * 与石子合并同结构，区别只在转移是「左×右 + score[根]」。
 */
export default function ScoreTreeDemo() {
  const [scores, setScores] = useState<number[]>([5, 7, 1, 2, 10])

  const model = useMemo(() => scoreTree(scores), [scores])
  const modelKey = `st-${scores.join('_')}`

  const setScore = (i: number, val: number) =>
    setScores((arr) => arr.map((s, k) => (k === i ? val : s)))
  const addNode = () => setScores((arr) => (arr.length < 5 ? [...arr, 3] : arr))
  const removeNode = (i: number) =>
    setScores((arr) => (arr.length > 3 ? arr.filter((_, k) => k !== i) : arr))

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">节点按中序排开（可改每个分数 · 3～5 个节点）</div>
          <div className="kd__items">
            {scores.map((s, i) => (
              <div className="kd__item" key={i}>
                <span className="kd__item-i">{i + 1}</span>
                {scores.length > 3 && (
                  <button className="kd__remove" onClick={() => removeNode(i)} aria-label="删除该节点">
                    <X size={12} />
                  </button>
                )}
                <Stepper label="分数 score" value={s} min={1} max={30} onChange={(v) => setScore(i, v)} />
              </div>
            ))}
            {scores.length < 5 && (
              <button className="kd__add" onClick={addNode}>
                <Plus size={14} /> 加一个节点
              </button>
            )}
          </div>
        </div>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
