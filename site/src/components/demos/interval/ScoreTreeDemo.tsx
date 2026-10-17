import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import treeHeroArt from '../../../assets/demo-art/interval-tree-instrument-v1.avif'
import { DemoSculptureHero } from '../shared'
import { scoreTree } from './scoreTreeSolver'
import '../shared/demo-workbench.css'

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
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label} 减`}>
          <Minus size={13} />
        </button>
        <span className="stepper__val">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`${label} 加`}>
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}

/**
 * 加分二叉樹區間 DP 三角表演示：dp[i][j] 按區間長度遞推，
 * 逐格高亮被選中的根 k 與它的左、右子樹來源 dp[i][k-1]、dp[k+1][j]。
 * 與石子合併同結構，區別只在轉移是「左×右 + score[根]」。
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
      <DemoSculptureHero family="c" lesson="tree" src={treeHeroArt} />
      <div className="demo-control__toolbar">
        <div>
          <div className="demo-control__group-label">节点按中序排开（可改每个分数 · 3～5 个节点）</div>
          <div className="demo-control__items">
            {scores.map((s, i) => (
              <div className="demo-control__item" key={i}>
                <span className="demo-control__item-i">{i + 1}</span>
                {scores.length > 3 && (
                  <button type="button" className="demo-control__remove" onClick={() => removeNode(i)} aria-label="删除该节点">
                    <X size={12} />
                  </button>
                )}
                <Stepper label="分数 score" value={s} min={1} max={30} onChange={(v) => setScore(i, v)} />
              </div>
            ))}
            {scores.length < 5 && (
              <button type="button" className="demo-control__add" onClick={addNode}>
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
