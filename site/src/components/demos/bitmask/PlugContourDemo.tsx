import { useMemo } from 'react'
import { Check } from 'lucide-react'
import { useStepPlayer } from '../../dp-engine/playback/useStepPlayer.ts'
import plugHeroArt from '../../../assets/demo-art/bitmask-plug-instrument-v1.avif'
import {
  DemoDetailSwitch,
  DemoSculptureHero,
  DemoTableViewport,
  DemoWorkbench,
  InstrumentRail,
  VizStateKey,
  VizStateMark,
} from '../shared'
import './plug-contour-demo.css'

const FRAMES = [
  { row: 0, col: 0, plugs: [0, 1, 2, 0, 0], action: '新建一对插头', role: 'source' as const },
  { row: 0, col: 1, plugs: [0, 0, 1, 2, 0], action: '右移并保持配对', role: 'current' as const },
  { row: 0, col: 2, plugs: [0, 1, 0, 2, 0], action: '单插头延续', role: 'current' as const },
  { row: 1, col: 0, plugs: [1, 0, 2, 0, 0], action: '换行并左移两位', role: 'settled' as const },
  { row: 1, col: 1, plugs: [0, 1, 2, 0, 0], action: '匹配括号并合并', role: 'chosen' as const },
  { row: 1, col: 2, plugs: [0, 0, 0, 0, 0], action: '最后格合法闭环', role: 'chosen' as const },
]

const CELLS = Array.from({ length: 12 }, (_, index) => ({
  row: Math.floor(index / 4),
  col: index % 4,
}))

function PlugStage({ frameIndex }: { frameIndex: number }) {
  const frame = FRAMES[frameIndex] ?? FRAMES[0]
  const cell = 58
  const x0 = 66
  const y0 = 42
  const currentIndex = frame.row * 4 + frame.col
  const contourY = y0 + (frame.row + 1) * cell
  const contourX = x0 + (frame.col + 1) * cell
  const contour = `M${x0} ${contourY}H${contourX}V${contourY + cell}H${x0 + 4 * cell}`

  return (
    <div className="plug-stage">
      <svg viewBox="0 0 370 286" role="img" aria-label={`处理第 ${frame.row + 1} 行第 ${frame.col + 1} 列：${frame.action}`}>
        <defs>
          <linearGradient id="plug-decided" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--g-1)" stopOpacity=".34" />
            <stop offset="1" stopColor="var(--g-1)" stopOpacity=".06" />
          </linearGradient>
        </defs>
        <g className="plug-stage__grid">
          {CELLS.map(({ row, col }, index) => {
            const settled = index < currentIndex
            const current = index === currentIndex
            return (
              <g key={`${row}-${col}`} transform={`translate(${x0 + col * cell} ${y0 + row * cell})`}>
                <polygon
                  points={`0,4 ${cell - 8},0 ${cell - 3},${cell - 10} 5,${cell - 4}`}
                  data-viz-role={current ? 'current' : settled ? 'settled' : 'source'}
                  fill={settled ? 'url(#plug-decided)' : undefined}
                />
                <text x={(cell - 3) / 2} y={cell / 2 + 4}>{row + 1},{col + 1}</text>
              </g>
            )
          })}
        </g>
        <path className="plug-stage__contour" d={contour} />
        <g className="plug-stage__plugs" transform={`translate(${x0} ${contourY})`}>
          {frame.plugs.map((plug, index) => (
            <g
              key={index}
              transform={`translate(${index * cell} 0)`}
              data-viz-role={plug === 0 ? 'settled' : index === frame.col + 1 ? frame.role : 'source'}
            >
              <polygon points="0,-10 10,0 0,10 -10,0" />
              <text y="4">{plug === 1 ? '(' : plug === 2 ? ')' : '·'}</text>
            </g>
          ))}
        </g>
        <g className="plug-stage__cursor" transform={`translate(${x0 + frame.col * cell + cell / 2} ${y0 + frame.row * cell + cell / 2})`}>
          <path d="M-18-22H18M22-18V18M18 22H-18M-22 18V-18" />
        </g>
      </svg>
      <div
        className="plug-stage__mobile"
        role="img"
        aria-label={`移动端轮廓状态：处理第 ${frame.row + 1} 行第 ${frame.col + 1} 列，${frame.action}`}
      >
        <header>
          <span>scan cell</span>
          <strong>{frame.row + 1} · {frame.col + 1}</strong>
          <small>{frame.action}</small>
        </header>
        <span className="plug-stage__mobile-rail" aria-hidden="true" />
        <ol>
          {frame.plugs.map((plug, index) => {
            const role = plug === 0 ? 'settled' : index === frame.col + 1 ? frame.role : 'source'
            return (
              <li key={index} data-viz-role={role}>
                <span>{String(index).padStart(2, '0')}</span>
                <strong>{plug === 1 ? '(' : plug === 2 ? ')' : '·'}</strong>
                <small>{plug === 0 ? 'empty' : role}</small>
              </li>
            )
          })}
        </ol>
      </div>
      <div className="plug-stage__readout">
        <span>state</span>
        <strong>{frame.plugs.join(' ')}</strong>
        <small>{frame.action}</small>
      </div>
    </div>
  )
}

function PlugTable({ frameIndex }: { frameIndex: number }) {
  return (
    <DemoTableViewport label="插头 DP 轮廓状态转移表">
      <table className="plug-table">
        <thead>
          <tr>
            <th scope="col">步骤</th>
            <th scope="col">格子</th>
            <th scope="col">轮廓状态</th>
            <th scope="col">转移</th>
            <th scope="col">角色</th>
          </tr>
        </thead>
        <tbody>
          {FRAMES.map((frame, index) => (
            <tr key={frame.action} data-active={index === frameIndex ? 'true' : 'false'}>
              <th scope="row">{index + 1}</th>
              <td>{frame.row + 1},{frame.col + 1}</td>
              <td>{frame.plugs.join(' ')}</td>
              <td>{frame.action}</td>
              <td><VizStateMark role={frame.role} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </DemoTableViewport>
  )
}

export default function PlugContourDemo() {
  const player = useStepPlayer(FRAMES.length)
  const frame = FRAMES[player.index] ?? FRAMES[0]
  const trace = useMemo(
    () => FRAMES.map((candidate, index) => ({
      ...candidate,
      complete: index < player.index,
      active: index === player.index,
    })),
    [player.index],
  )

  return (
    <>
      <DemoSculptureHero family="g" lesson="plug" src={plugHeroArt} />
      <DemoWorkbench
        family="g"
        title="轮廓线连通性扫描仪"
        description="逐格推进折线，显式观察括号插头的新建、延续、换行、合并与合法闭环。状态不是二进制背景纹理，而是当前轮廓上的稀疏连接。"
        activeRole={frame.role}
        complete={player.index === FRAMES.length - 1}
        className="plug-contour-demo"
        status={(
          <>
            <VizStateMark role={frame.role}>{frame.action}</VizStateMark>
            <span>{player.index + 1} / {FRAMES.length}</span>
          </>
        )}
        visual={<PlugStage frameIndex={player.index} />}
        rail={(
          <InstrumentRail
            player={player}
            label="插头 DP 轮廓线逐帧播放"
            secondaryLabel="状态编码"
            secondary={<VizStateKey />}
          />
        )}
        details={(
          <DemoDetailSwitch
            items={[
              { id: 'states', label: '状态', content: <VizStateKey /> },
              { id: 'table', label: '表格', content: <PlugTable frameIndex={player.index} /> },
              {
                id: 'trace',
                label: '轨迹',
                content: (
                  <ol className="plug-trace">
                    {trace.map((candidate, index) => (
                      <li key={candidate.action} data-active={candidate.active ? 'true' : 'false'}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{candidate.action}</strong>
                        {candidate.complete && <Check size={14} aria-label="已完成" />}
                      </li>
                    ))}
                  </ol>
                ),
              },
            ]}
          />
        )}
      />
    </>
  )
}
