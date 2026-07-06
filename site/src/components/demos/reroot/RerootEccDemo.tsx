import { useMemo, useState } from 'react'
import { M } from '../../ui/Math'
import { buildTree, layoutTree, eccentricity } from './rerootSolver'
import type { Edge } from './rerootSolver'
import { TreeCanvas } from './TreeCanvas'
import type { NodeStyle, EdgeStyle } from './TreeCanvas'
import './reroot-demo.css'

// 主链 + 分支的小树，直观展示「每点偏心距」与中心。点节点看它到最远点的距离拆成
// 向下 down1 / 向上 up 两支，最大者即偏心距；全树偏心距最小者=中心。
const N = 8
const EDGES: Edge[] = [
  { u: 0, v: 1 },
  { u: 1, v: 2 },
  { u: 2, v: 3 },
  { u: 3, v: 4 },
  { u: 2, v: 5 },
  { u: 5, v: 6 },
  { u: 1, v: 7 },
]

export default function RerootEccDemo() {
  const [sel, setSel] = useState(2)

  const { tree, nodes, maxDepth, ecc } = useMemo(() => {
    const tree = buildTree(N, EDGES, 0)
    const { nodes, maxDepth } = layoutTree(tree)
    const ecc = eccentricity(tree)
    return { tree, nodes, maxDepth, ecc }
  }, [])

  const nodeStyle = (id: number): NodeStyle => {
    if (id === sel) {
      return {
        fill: 'var(--grad-accent)',
        stroke: 'var(--accent-1)',
        strokeWidth: 3,
        textFill: 'var(--text-on-accent)',
        r: 23,
      }
    }
    if (id === ecc.center) {
      return {
        fill: 'color-mix(in srgb, var(--viz-chosen) 20%, var(--surface-3))',
        stroke: 'var(--viz-chosen)',
        strokeWidth: 2.5,
        textFill: 'var(--text-1)',
      }
    }
    return { fill: 'var(--surface-3)', stroke: 'var(--border-strong)', strokeWidth: 1.5, textFill: 'var(--text-1)' }
  }

  const edgeStyle = (): EdgeStyle => ({ stroke: 'var(--border-strong)', strokeWidth: 1.8 })

  return (
    <div>
      <div className="rr__hint">
        点任意节点，看它的<strong>偏心距</strong>（到最远点的距离）= max(向下最长链 down, 向上最长链 up)。
        绿圈是偏心距<strong>最小</strong>的点 = 树的<strong>中心</strong>（半径 <b>{ecc.radius}</b>），
        全树最大偏心距 = <strong>直径</strong> <b>{ecc.diameter}</b>。
      </div>

      <div className="rr__stage">
        <TreeCanvas
          tree={tree}
          nodes={nodes}
          maxDepth={maxDepth}
          nodeStyle={nodeStyle}
          edgeStyle={edgeStyle}
          subLabel={(id) => `e${ecc.ecc[id]}`}
          onNodeClick={setSel}
          ariaLabel="点节点看它的偏心距，绿圈为树的中心"
        />
      </div>

      <div className="rr__split">
        <div className="rr__split-card down">
          <div className="k">向下最长链 down1[{sel + 1}]</div>
          <div className="v">{ecc.down1[sel]}</div>
        </div>
        <div className="rr__split-card up">
          <div className="k">向上最长链 up[{sel + 1}]（父方向）</div>
          <div className="v">{ecc.up[sel]}</div>
        </div>
        <div className="rr__split-card tot">
          <div className="k">偏心距 = max(down, up)</div>
          <div className="v">
            max({ecc.down1[sel]}, {ecc.up[sel]}) = {ecc.ecc[sel]}
          </div>
        </div>
      </div>

      <div className="rr__caption">
        节点 <b style={{ color: 'var(--accent-1)' }}>{sel + 1}</b> 到最远点的距离是 <b>{ecc.ecc[sel]}</b>。
        它由两支较量决出：往子树里最深走 <M>{'\\mathrm{down}'}</M>，或经父亲往树的其余部分最远走 <M>{'\\mathrm{up}'}</M>，取较大者。
        <M>{'\\mathrm{up}'}</M> 正是换根第二遍求的——把「父的最长链（避开自己这支）」加一条边传下来。
        {sel === ecc.center && <strong>　它就是当前的中心（偏心距最小）。</strong>}
      </div>
    </div>
  )
}
