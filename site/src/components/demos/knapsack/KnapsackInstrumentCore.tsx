import { useEffect, useRef, type CSSProperties } from 'react'
import instrumentArt from '../../../assets/demo-art/knapsack-01-instrument.avif'
import type { Item } from './solvers.ts'

type KnapsackMode = '2D' | 'reverse' | 'forward' | 'complete'

export type KnapsackInstrumentDecision = 'idle' | 'take' | 'skip' | 'invalid' | 'complete'

export interface KnapsackInstrumentPlayback {
  step: number
  count: number
  itemIndex: number | null
  capacity: number | null
  decision: KnapsackInstrumentDecision
  playing: boolean
}

const MODE_LABELS: Record<KnapsackMode, string> = {
  '2D': '二维原型',
  reverse: '一维逆推',
  forward: '一维顺推',
  complete: '完全背包',
}

type KnapsackInstrumentCoreProps = {
  items: readonly Item[]
  capacity: number
  mode: KnapsackMode
  variant: '01' | 'complete'
  playback: KnapsackInstrumentPlayback
}

export function KnapsackInstrumentCore({
  items,
  capacity,
  mode,
  variant,
  playback,
}: KnapsackInstrumentCoreProps) {
  const capacityRailRef = useRef<HTMLDivElement>(null)
  const weights = new Set(items.map((item) => item.w))
  const railStyle = {
    '--capacity-columns': capacity + 1,
  } as CSSProperties
  const activeItem = playback.itemIndex === null ? null : items[playback.itemIndex - 1]
  const decisionLabel = {
    idle: '等待开始',
    take: '取入背包',
    skip: '保留旧值',
    invalid: '发现重复取用',
    complete: '计算完成',
  }[playback.decision]
  const routePath = playback.decision === 'skip'
    ? 'M 24 31 C 36 31 42 36 48 40 S 56 50 63 51'
    : 'M 24 31 C 38 31 43 28 50 27 S 68 28 78 29'

  useEffect(() => {
    const rail = capacityRailRef.current
    if (!rail || playback.capacity === null) return
    const target = rail.querySelector<HTMLElement>(`[data-capacity="${playback.capacity}"]`)
    if (!target) return
    const nextLeft = target.offsetLeft - (rail.clientWidth - target.offsetWidth) / 2
    rail.scrollLeft = Math.max(0, nextLeft)
  }, [capacity, playback.capacity])

  return (
    <figure
      className="knapsack-instrument"
      data-mode={mode}
      data-decision={playback.decision}
      data-playing={playback.playing ? 'true' : 'false'}
      aria-label={`${variant === '01' ? '01 背包' : '完全背包'}算法雕塑：${items.length} 件物品，容量 ${capacity}，${MODE_LABELS[mode]}`}
    >
      <div className="knapsack-instrument__scene" aria-hidden="true">
        <img
          className="knapsack-instrument__art"
          src={instrumentArt}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <ol className="knapsack-instrument__objects" data-many={items.length > 4 ? 'true' : 'false'}>
          {items.map((item, index) => {
            const isActive = playback.itemIndex === index + 1
            return (
              <li key={`${index}-${item.w}-${item.v}`} className={isActive ? 'is-active' : undefined}>
                <span className="knapsack-instrument__object" data-shape={index % 3} />
                <small>{item.w}/{item.v}</small>
              </li>
            )
          })}
        </ol>
        <svg className="knapsack-instrument__motion" viewBox="0 0 100 60" preserveAspectRatio="none">
          <path d={routePath} pathLength="1" />
          {playback.decision !== 'idle' && playback.decision !== 'complete' && (
            <circle key={playback.step} r="1.2">
              <animateMotion path={routePath} dur="420ms" fill="freeze" />
            </circle>
          )}
        </svg>
      </div>

      <p className="knapsack-instrument__live" aria-live="polite">
        {activeItem && playback.capacity !== null
          ? `正在计算物品 ${playback.itemIndex}（重量 ${activeItem.w}，价值 ${activeItem.v}），容量 ${playback.capacity}：${decisionLabel}`
          : decisionLabel}
      </p>

      <div className="knapsack-instrument__readout">
        <div className="knapsack-instrument__mode">
          <span>{variant === '01' ? '整件取舍' : '允许重复取用'}</span>
          <strong>{MODE_LABELS[mode]}</strong>
        </div>
        <ol className="knapsack-instrument__items" aria-label="当前物品">
          {items.map((item, index) => (
            <li
              key={`${index}-${item.w}-${item.v}`}
              className={playback.itemIndex === index + 1 ? 'is-active' : undefined}
              aria-current={playback.itemIndex === index + 1 ? 'step' : undefined}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <b>w {item.w}</b>
              <small>v {item.v}</small>
            </li>
          ))}
        </ol>
      </div>

      <div className="knapsack-instrument__capacity">
        <div className="knapsack-instrument__capacity-label">
          <span>容量状态轨</span>
          <strong>{playback.capacity === null ? `0 - ${capacity}` : `j ${playback.capacity} / ${capacity}`}</strong>
        </div>
        <div ref={capacityRailRef} className="knapsack-instrument__capacity-rail">
          <ol style={railStyle} aria-label={`容量状态 0 到 ${capacity}`}>
            {Array.from({ length: capacity + 1 }, (_, value) => (
              <li
                key={value}
                className={[
                  weights.has(value) ? 'is-item-weight' : '',
                  playback.capacity === value ? 'is-active' : '',
                ].filter(Boolean).join(' ') || undefined}
                data-capacity={value}
                aria-current={playback.capacity === value ? 'step' : undefined}
                aria-label={`容量 ${value}${weights.has(value) ? '，对应物品重量' : ''}`}
              >
                {value}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </figure>
  )
}
