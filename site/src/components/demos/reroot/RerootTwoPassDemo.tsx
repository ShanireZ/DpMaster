import { useMemo, useState } from 'react'
import { M } from '../../ui/Math'
import { PlaybackControls } from '../../dp-engine/playback/PlaybackControls'
import { useStepPlayer } from '../../dp-engine/playback/useStepPlayer'
import { buildTree, layoutTree, rerootDistSum, rerootFrames, bruteDistSum } from './rerootSolver'
import type { Edge } from './rerootSolver'
import { TreeCanvas } from './TreeCanvas'
import type { NodeStyle, EdgeStyle } from './TreeCanvas'
import './reroot-demo.css'

// 三棵预置小树（0-based 边）。故意选形状不同，让「换根系数」的正负对比明显。
const TREES: { key: string; label: string; n: number; edges: Edge[] }[] = [
  {
    key: 'chain',
    label: '链 (6 点)',
    n: 6,
    edges: [
      { u: 0, v: 1 },
      { u: 1, v: 2 },
      { u: 2, v: 3 },
      { u: 3, v: 4 },
      { u: 4, v: 5 },
    ],
  },
  {
    key: 'star',
    label: '星形 (6 点)',
    n: 6,
    edges: [
      { u: 0, v: 1 },
      { u: 0, v: 2 },
      { u: 0, v: 3 },
      { u: 0, v: 4 },
      { u: 0, v: 5 },
    ],
  },
  {
    key: 'bushy',
    label: '分叉树 (7 点)',
    n: 7,
    edges: [
      { u: 0, v: 1 },
      { u: 0, v: 2 },
      { u: 1, v: 3 },
      { u: 1, v: 4 },
      { u: 2, v: 5 },
      { u: 2, v: 6 },
    ],
  },
]

export default function RerootTwoPassDemo() {
  const [treeKey, setTreeKey] = useState('bushy')
  const spec = TREES.find((t) => t.key === treeKey) ?? TREES[2]

  const { nodes, maxDepth, res, frames, brute } = useMemo(() => {
    const tree = buildTree(spec.n, spec.edges, 0)
    const { nodes, maxDepth } = layoutTree(tree)
    const res = rerootDistSum(tree, 'unweighted')
    const frames = rerootFrames(tree, res)
    const brute = bruteDistSum(tree, 'unweighted')
    return { nodes, maxDepth, res, frames, brute }
  }, [spec])

  const player = useStepPlayer(frames.length)
  const f = frames[Math.min(player.index, frames.length - 1)]

  // 换树时重置播放（key 变→组件 remount，见下方 wrapper）
  const nodeStyle = (id: number): NodeStyle => {
    const isActive = f.active === id
    const isRoot = f.rootHighlight === id
    const szOn = f.szKnown[id]
    const distOn = f.distKnown[id]
    if (isActive) {
      return {
        fill: 'var(--grad-accent)',
        stroke: 'var(--accent-1)',
        strokeWidth: 3,
        textFill: 'var(--text-on-accent)',
        r: 23,
      }
    }
    if (f.phase === 'pass1' || f.phase === 'pass1done') {
      // 第一遍：已算 sz 的点用青色（source）描边
      return szOn
        ? {
            fill: 'color-mix(in srgb, var(--viz-source) 16%, var(--surface-3))',
            stroke: 'var(--viz-source)',
            strokeWidth: 2,
            textFill: 'var(--text-1)',
          }
        : { fill: 'var(--surface-3)', stroke: 'var(--border-strong)', strokeWidth: 1.5, textFill: 'var(--text-2)' }
    }
    // 第二遍 / done：已算 dist 的点用绿色（chosen）描边；当前根另有高亮
    if (isRoot) {
      return {
        fill: 'color-mix(in srgb, var(--accent-1) 22%, var(--surface-3))',
        stroke: 'var(--accent-1)',
        strokeWidth: 2.5,
        textFill: 'var(--text-1)',
      }
    }
    return distOn
      ? {
          fill: 'color-mix(in srgb, var(--viz-chosen) 15%, var(--surface-3))',
          stroke: 'var(--viz-chosen)',
          strokeWidth: 2,
          textFill: 'var(--text-1)',
        }
      : { fill: 'var(--surface-3)', stroke: 'var(--border-strong)', strokeWidth: 1.5, textFill: 'var(--text-2)' }
  }

  const edgeStyle = (child: number, parent: number): EdgeStyle => {
    // pass2 当前换根的那条边高亮
    if (f.phase === 'pass2' && f.active === child && f.fromParent === parent) {
      return { stroke: 'var(--accent-1)', strokeWidth: 3.5 }
    }
    return { stroke: 'var(--border-strong)', strokeWidth: 1.8 }
  }

  // 节点副标签：pass1 显示已知的 sz，pass2/done 显示已知的 dist
  const subLabel = (id: number): string | null => {
    if (f.phase === 'intro') return null
    if (f.phase === 'pass1' || f.phase === 'pass1done') {
      return f.szKnown[id] ? `sz${res.sz[id]}` : null
    }
    return f.distKnown[id] ? `f${res.dist[id]}` : null
  }

  const phasePill =
    f.phase === 'pass1' || f.phase === 'pass1done' ? (
      <span className="rr__phase p1">第一遍 · 求 sz[]</span>
    ) : f.phase === 'pass2' ? (
      <span className="rr__phase p2">第二遍 · 换根</span>
    ) : f.phase === 'done' ? (
      <span className="rr__phase p2">完成 · O(n)</span>
    ) : (
      <span className="rr__phase">准备</span>
    )

  // 对照读数：暴力 BFS 的访问次数 vs 换根的一遍规模
  const n = spec.n

  return (
    <div key={treeKey}>
      <div className="rr__toolbar">
        <span className="rr__toolbar-label">选一棵树</span>
        <div className="rr__tree-picker" role="group" aria-label="选择树形">
          {TREES.map((t) => (
            <button
              key={t.key}
              className={`rr__tree-pill${t.key === treeKey ? ' on' : ''}`}
              onClick={() => setTreeKey(t.key)}
              aria-pressed={t.key === treeKey}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rr__phase-row">{phasePill}</div>
      <PlaybackControls player={player} variant="compact" label="换根 DP 两遍扫描逐帧播放" />

      <div className="rr__stage">
        <TreeCanvas
          nodes={nodes}
          maxDepth={maxDepth}
          nodeStyle={nodeStyle}
          edgeStyle={edgeStyle}
          subLabel={subLabel}
          ariaLabel="换根 DP 两遍扫描：第一遍自底向上求子树大小，第二遍顺边换根"
        />
      </div>

      <div className="rr__caption" dangerouslySetInnerHTML={{ __html: f.caption }} />

      <div className="rr__cmp">
        <div className="rr__cmp-card brute">
          <div className="k">暴力 · 每点各跑一遍 BFS</div>
          <div className="v">
            O(n²) · 共访问 {brute.ops} 次
          </div>
        </div>
        <div className="rr__cmp-card reroot">
          <div className="k">换根 · 两遍 DFS 合计</div>
          <div className="v">O(n) · 约 {2 * n} 步</div>
        </div>
      </div>
      <div className="rr__dist-legend">
        <span>
          <span className="sw" style={{ background: 'var(--viz-source)' }} />第一遍点亮 = sz[] 已求
        </span>
        <span>
          <span className="sw" style={{ background: 'var(--viz-chosen)' }} />第二遍点亮 = 该点距离和已求
        </span>
        <span>
          <span className="sw" style={{ background: 'var(--accent-1)' }} />当前处理 / 当前根
        </span>
      </div>
      <p style={{ marginTop: 'var(--sp-3)', fontSize: 13, color: 'var(--text-3)' }}>
        暴力的 <M>{'O(n^2)'}</M> 是「每个点都从头 BFS 一遍」；换根只走两遍 DFS 就把全部 <M>{'n'}</M> 个点的答案填满。
      </p>
    </div>
  )
}
