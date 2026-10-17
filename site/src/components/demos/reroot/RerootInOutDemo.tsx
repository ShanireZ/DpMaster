import { useMemo, useState } from 'react'
import { M } from '../../ui/Math'
import inoutHeroArt from '../../../assets/demo-art/reroot-inout-instrument-v1.avif'
import { DemoSculptureHero } from '../shared'
import { buildTree, layoutTree, inOutDecompose } from './rerootSolver'
import type { Edge } from './rerootSolver'
import { TreeCanvas } from './TreeCanvas'
import type { NodeStyle, EdgeStyle } from './TreeCanvas'
import './reroot-demo.css'

// 固定根 0，把每個點的距離和拆成「子樹內 down」+「子樹外 up」兩塊。
// 點一個點：樹上按「在它子樹內 / 外」分色，右側讀數給出 down+up=dist，
// 並點破 up[u] = dist[父] − (父方向裡被自己子樹佔掉的那部分) 的換根回推。
const N = 8
const EDGES: Edge[] = [
  { u: 0, v: 1 },
  { u: 0, v: 2 },
  { u: 1, v: 3 },
  { u: 1, v: 4 },
  { u: 3, v: 5 },
  { u: 2, v: 6 },
  { u: 2, v: 7 },
]

export default function RerootInOutDemo() {
  const [sel, setSel] = useState(1)

  const { tree, nodes, maxDepth, io, inSub } = useMemo(() => {
    const tree = buildTree(N, EDGES, 0)
    const { nodes, maxDepth } = layoutTree(tree)
    const io = inOutDecompose(tree)
    // 計算 sel 的子樹集合（用於分色）
    const inSub = new Array<boolean>(N).fill(false)
    const stack = [sel]
    while (stack.length) {
      const u = stack.pop() as number
      inSub[u] = true
      for (const c of tree.children[u]) stack.push(c)
    }
    return { tree, nodes, maxDepth, io, inSub }
  }, [sel])

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
    // 在 sel 子樹內 = 青（down 方向）；子樹外 = 灰紫強調淺底（up 方向）
    return inSub[id]
      ? {
          fill: 'color-mix(in srgb, var(--viz-source) 16%, var(--surface-3))',
          stroke: 'var(--viz-source)',
          strokeWidth: 2,
          textFill: 'var(--text-1)',
        }
      : {
          fill: 'color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))',
          stroke: 'color-mix(in srgb, var(--accent-1) 55%, var(--border-strong))',
          strokeWidth: 1.8,
          textFill: 'var(--text-1)',
        }
  }

  const edgeStyle = (child: number): EdgeStyle => {
    // 連向 sel 子樹內的邊高亮青，其餘灰
    return inSub[child]
      ? { stroke: 'var(--viz-source)', strokeWidth: 2.4 }
      : { stroke: 'var(--border-strong)', strokeWidth: 1.6 }
  }

  const down = io.down[sel]
  const up = io.up[sel]
  const dist = io.dist[sel]
  const parent = tree.parent[sel]

  return (
    <div>
      <DemoSculptureHero family="e" lesson="inout" src={inoutHeroArt} />
      <div className="rr__hint">
        固定根 = 节点 1。点任意节点，把它的距离和拆成两块：
        <span style={{ color: 'var(--viz-source)' }}>子树内（向下，down）</span> +{' '}
        <span style={{ color: 'var(--accent-1)' }}>子树外（父方向，up）</span>。
      </div>

      <div className="rr__stage">
        <TreeCanvas
          nodes={nodes}
          maxDepth={maxDepth}
          nodeStyle={nodeStyle}
          edgeStyle={edgeStyle}
          subLabel={(id) => (id === sel ? null : inSub[id] ? '内' : '外')}
          onNodeClick={setSel}
          ariaLabel="点节点，把它的距离和拆成子树内与子树外两部分"
        />
      </div>

      <div className="rr__split">
        <div className="rr__split-card down">
          <div className="k">子树内 down[{sel + 1}]（向下）</div>
          <div className="v">{down}</div>
        </div>
        <div className="rr__split-card up">
          <div className="k">子树外 up[{sel + 1}]（父方向）</div>
          <div className="v">{up}</div>
        </div>
        <div className="rr__split-card tot">
          <div className="k">距离和 = 内 + 外</div>
          <div className="v">
            {down} + {up} = {dist}
          </div>
        </div>
      </div>

      <div className="rr__caption">
        {parent < 0 ? (
          <>
            <b>节点 {sel + 1} 是根</b>：它没有「子树外」，<M>{'\\mathrm{up}=0'}</M>，距离和就等于向下的{' '}
            <b>down = {down}</b>。这是换根的<strong>起点</strong>。
          </>
        ) : (
          <>
            换根到 <b>节点 {sel + 1}</b> 时，它的「子树外」<M>{'\\mathrm{up}[u]'}</M> 要从父亲{' '}
            <b>节点 {parent + 1}</b> 那里回推：父亲的全部信息里，<strong>减去「本来朝着自己这棵子树」的那部分</strong>，
            剩下的就是 <M>{'u'}</M> 的父方向贡献。子树内 <M>{'\\mathrm{down}'}</M> 在第一遍后序里已备好，
            子树外 <M>{'\\mathrm{up}'}</M> 在第二遍前序里由父传子——两者一合并，<b>dist[{sel + 1}] = {dist}</b>。
          </>
        )}
      </div>
    </div>
  )
}
