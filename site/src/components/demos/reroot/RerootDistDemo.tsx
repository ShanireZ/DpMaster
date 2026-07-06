import { useMemo, useState } from 'react'
import { M } from '../../ui/Math'
import { buildTree, layoutTree, rerootDistSum } from './rerootSolver'
import type { Edge } from './rerootSolver'
import { TreeCanvas } from './TreeCanvas'
import type { NodeStyle, EdgeStyle } from './TreeCanvas'
import './reroot-demo.css'

// 两种模式：无权（每点权 1）与点权（点上带「奶牛数」）。用同一棵 7 点树，直观看
// 「换根系数 = W − 2·sz[子树]」如何随子树内/外的点权配比变正负。
const N = 7
const EDGES: Edge[] = [
  { u: 0, v: 1 },
  { u: 0, v: 2 },
  { u: 1, v: 3 },
  { u: 1, v: 4 },
  { u: 2, v: 5 },
  { u: 2, v: 6 },
]
// 点权（模式 2 用）：故意让某些点权重，凸显重心偏移
const WEIGHT = [1, 3, 1, 2, 1, 4, 1]

export default function RerootDistDemo() {
  const [mode, setMode] = useState<'unweighted' | 'nodeWeighted'>('unweighted')
  const [rootSel, setRootSel] = useState(0) // 用户点选「以谁为根」

  const wt = mode === 'nodeWeighted' ? WEIGHT : new Array<number>(N).fill(1)

  // 以 rootSel 建树 → 求该根下的距离和；同时用固定根算全体（供最优点标注）
  const { nodes, maxDepth, distAll, best, bestNode, W, treeRooted, resRooted } = useMemo(() => {
    const t0 = buildTree(N, EDGES, 0, wt)
    const res0 = rerootDistSum(t0, mode)
    // 以 rootSel 重新建树，得到「rootSel 视角」的子树大小/系数（用于讲解展示）
    const tR = buildTree(N, EDGES, rootSel, wt)
    const resR = rerootDistSum(tR, mode)
    const { nodes, maxDepth } = layoutTree(tR)
    return {
      nodes,
      maxDepth,
      distAll: res0.dist, // 每点作根的距离和（与视角无关，客观值）
      best: res0.best,
      bestNode: res0.bestNode,
      W: res0.totalW,
      treeRooted: tR,
      resRooted: resR,
    }
  }, [mode, rootSel, wt])

  const distOfSel = distAll[rootSel]

  const nodeStyle = (id: number): NodeStyle => {
    const isRoot = id === rootSel
    const isBest = id === bestNode
    if (isRoot) {
      return {
        fill: 'var(--grad-accent)',
        stroke: 'var(--accent-1)',
        strokeWidth: 3,
        textFill: 'var(--text-on-accent)',
        r: 23,
      }
    }
    if (isBest) {
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

  // 副标签：无权显示该点作根的距离和；点权模式额外把点权显示在边标签处不便，故副标签给距离和
  const subLabel = (id: number): string | null => {
    if (mode === 'nodeWeighted') return `w${wt[id]}·d${distAll[id]}`
    return `d${distAll[id]}`
  }

  // 讲解：把 rootSel 的每个孩子子树的换根系数摊出来
  const childRows = treeRooted.children[rootSel].map((c) => ({
    c,
    sz: resRooted.sz[c],
    out: W - resRooted.sz[c],
    coef: W - 2 * resRooted.sz[c],
  }))

  return (
    <div>
      <div className="rr__toolbar">
        <span className="rr__toolbar-label">模式</span>
        <div className="rr__tree-picker" role="group" aria-label="选择模式">
          <button
            className={`rr__tree-pill${mode === 'unweighted' ? ' on' : ''}`}
            onClick={() => setMode('unweighted')}
            aria-pressed={mode === 'unweighted'}
          >
            无权（每点算 1）
          </button>
          <button
            className={`rr__tree-pill${mode === 'nodeWeighted' ? ' on' : ''}`}
            onClick={() => setMode('nodeWeighted')}
            aria-pressed={mode === 'nodeWeighted'}
          >
            点权（点上带数量）
          </button>
        </div>
      </div>

      <div className="rr__hint">
        点任意节点，把它设成<strong>根</strong>——立刻显示<strong>它到所有其它点的距离和</strong>。
        绿圈是使距离和<strong>最小</strong>的点（<b>d = {best}</b>），也就是树的{mode === 'nodeWeighted' ? '带权' : ''}重心方向。
      </div>

      <div className="rr__stage">
        <TreeCanvas
          nodes={nodes}
          maxDepth={maxDepth}
          nodeStyle={nodeStyle}
          edgeStyle={edgeStyle}
          subLabel={subLabel}
          onNodeClick={setRootSel}
          ariaLabel="点节点把它设为根，看它到所有其它点的距离和"
        />
      </div>

      <div className="rr__split">
        <div className="rr__split-card tot">
          <div className="k">当前根 = 节点 {rootSel + 1} 的距离和</div>
          <div className="v">d[{rootSel + 1}] = {distOfSel}</div>
        </div>
        <div className="rr__split-card down">
          <div className="k">总点权 W {mode === 'nodeWeighted' ? '（各点数量之和）' : '（= 点数 n）'}</div>
          <div className="v">W = {W}</div>
        </div>
        <div className="rr__split-card up">
          <div className="k">最小距离和（重心）</div>
          <div className="v">节点 {bestNode + 1} · d = {best}</div>
        </div>
      </div>

      <div className="rr__caption">
        以 <b style={{ color: 'var(--accent-1)' }}>节点 {rootSel + 1}</b> 为根，往它的每个孩子换根时的系数{' '}
        <M>{'W-2\\cdot \\mathrm{sz}'}</M>：
        <div className="rr__layer-tags">
          {childRows.length === 0 ? (
            <span className="rr__layer-tag">它是叶子，没有向下的孩子可换根</span>
          ) : (
            childRows.map((r) => (
              <span key={r.c} className="rr__layer-tag">
                → 子 {r.c + 1}：子树内 {r.sz}、外 {r.out}，系数 = {W} − 2×{r.sz} ={' '}
                <b style={{ color: r.coef < 0 ? 'var(--viz-chosen)' : 'var(--viz-invalid)' }}>{r.coef}</b>
              </span>
            ))
          )}
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--text-3)' }}>
          系数为<span style={{ color: 'var(--viz-chosen)' }}>负</span>（子树内点权 &gt; 一半）→ 往那边挪根<strong>更优</strong>；
          为<span style={{ color: 'var(--viz-invalid)' }}>正</span>→ 挪过去更差。顺着「负系数」的方向一路走，就走到重心。
        </p>
      </div>
    </div>
  )
}
