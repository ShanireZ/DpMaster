import { useMemo, useState } from 'react'
import { Minus, Plus, X, ChevronLeft, ChevronRight, RotateCcw, Wallet, TrendingUp } from 'lucide-react'
import { stockStates, stockBestProfit } from './fsmSolver'
import './fsm-stock.css'

const PRESETS: { label: string; p: number[] }[] = [
  { label: '经典波动', p: [7, 1, 5, 3, 6, 4] },
  { label: '单调上涨', p: [1, 2, 3, 4, 5] },
  { label: '尖峰回落', p: [2, 4, 1, 7, 3] },
]

const NEG = -1e9
const fmt = (v: number) => (v <= -1e8 ? '−∞' : String(v))

/**
 * 第二演示 · 股票买卖状态机（自建可视化，非 DPViz）。
 * 两状态节点「持有 / 空仓」逐日更新最优现金，价格时间轴上逐日点亮
 * 买 / 卖 / 持有 / 空仓（可选冷却期）四种动作。价格序列可编辑、可勾选冷却。
 * 递推来自 stockStates；无冷却时最终「空仓」值 = 无限次交易最优利润（stockBestProfit 核对）。
 */
export default function StockStateDemo() {
  const [prices, setPrices] = useState<number[]>(PRESETS[0].p)
  const [cooldown, setCooldown] = useState(false)
  const [day, setDay] = useState(prices.length) // 当前走到第几天（1..n）

  const days = useMemo(() => stockStates(prices, cooldown), [prices, cooldown])
  const naiveBest = useMemo(() => stockBestProfit(prices), [prices])

  const clampDay = (d: number) => Math.max(1, Math.min(prices.length, d))
  const curIdx = clampDay(day) - 1
  const cur = days[curIdx]

  const setAt = (i: number, v: number) => setPrices((arr) => arr.map((x, k) => (k === i ? v : x)))
  const removeAt = (i: number) =>
    setPrices((arr) => {
      const next = arr.filter((_, k) => k !== i)
      setDay((d) => Math.min(d, next.length))
      return next
    })
  const addOne = () =>
    setPrices((arr) => {
      const next = [...arr, Math.max(1, arr[arr.length - 1] ?? 1)]
      setDay(next.length)
      return next
    })
  const pickPreset = (p: number[]) => {
    setPrices(p)
    setDay(p.length)
  }

  const maxPrice = Math.max(...prices, 1)

  return (
    <div>
      {/* 预设 + 冷却开关 */}
      <div className="kd__modes">
        {PRESETS.map((pr) => (
          <button
            key={pr.label}
            className={`kd__mode${prices.join(',') === pr.p.join(',') ? ' on' : ''}`}
            onClick={() => pickPreset(pr.p)}
          >
            {pr.label}
          </button>
        ))}
      </div>

      {/* 价格编辑器 + 冷却 */}
      <div className="stk__toolbar">
        <div>
          <div className="stk__group-label">价格序列 price[]（每天一个，可增减 / 加删）</div>
          <div className="stk__prices">
            {prices.map((v, i) => (
              <div className="stk__price-item" key={i}>
                {prices.length > 2 && (
                  <button className="kd__remove" onClick={() => removeAt(i)} aria-label="删除这天">
                    <X size={12} />
                  </button>
                )}
                <div className="stepper__lab">第 {i + 1} 天</div>
                <div className="stepper__row">
                  <button onClick={() => setAt(i, Math.max(1, v - 1))} disabled={v <= 1} aria-label="减">
                    <Minus size={12} />
                  </button>
                  <span className="stepper__val">{v}</span>
                  <button onClick={() => setAt(i, Math.min(20, v + 1))} disabled={v >= 20} aria-label="加">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
            {prices.length < 9 && (
              <button className="kd__add" onClick={addOne}>
                <Plus size={15} /> 加一天
              </button>
            )}
          </div>
        </div>
        <label className="stk__cd">
          <input type="checkbox" checked={cooldown} onChange={(e) => setCooldown(e.target.checked)} />
          冷却期（卖出次日不能买入）
        </label>
      </div>

      {/* ① 价格时间轴：逐日柱 + 当日动作徽标 */}
      <div className="stk__timeline-label">
        <span>
          逐日推演：点某天或用下方按钮走到第 <b className="mono">{clampDay(day)}</b> 天
        </span>
        <span className="mono">买 / 卖 / 持 / 空{cooldown ? ' / 冷' : ''}</span>
      </div>
      <div className="stk__track">
        {days.map((d, i) => {
          const cls = i < curIdx ? 'past' : i > curIdx ? 'future' : 'active'
          const act = d.cashFrom === 'sell' ? 'sell' : d.holdFrom === 'buy' ? 'buy' : d.froze ? 'froze' : 'hold'
          const actLab = act === 'sell' ? '卖' : act === 'buy' ? '买' : act === 'froze' ? '冷' : '持/空'
          return (
            <div
              key={i}
              className={`stk__day ${cls}`}
              onClick={() => setDay(i + 1)}
              title={`第 ${i + 1} 天，价 ${d.price}`}
            >
              <span className="stk__price-num">{d.price}</span>
              <div className="stk__bar-wrap">
                <div className="stk__bar" style={{ height: `${8 + (d.price / maxPrice) * 56}px` }} />
              </div>
              <span className={`stk__act ${act}`}>{actLab}</span>
              <span className="stk__day-idx">d{i + 1}</span>
            </div>
          )
        })}
      </div>

      {/* ② 两状态节点：持有 / 空仓，及当日转移来源 */}
      <div className="stk__machine">
        <div className="stk__machine-label">
          第 <b>{clampDay(day)}</b> 天（价 <b>{cur.price}</b>）结束时，两状态的最优现金：
        </div>
        <div className="stk__nodes">
          <div className={`stk__node hold${cur.hold > NEG / 2 ? ' on' : ''}`}>
            <div className="stk__node-head">
              <span className="stk__node-dot" />
              <TrendingUp size={15} /> 持有一股（hold）
            </div>
            <div className={`stk__node-val${cur.hold <= NEG / 2 ? ' neg' : ''}`}>{fmt(cur.hold)}</div>
            <div className="stk__node-sub">
              手里握着一股时的最优现金（已垫付买入价）。今日由：
            </div>
            <span className={`stk__edge ${cur.holdFrom === 'buy' ? 'buy' : 'keep'}`}>
              {cur.holdFrom === 'buy' ? `今日买入（−${cur.price}）` : '继续持有（不动）'}
            </span>
          </div>
          <div className="stk__node cash on">
            <div className="stk__node-head">
              <span className="stk__node-dot" />
              <Wallet size={15} /> 空仓（cash）
            </div>
            <div className="stk__node-val">{fmt(cur.cash)}</div>
            <div className="stk__node-sub">手里没有股票时的最优现金（落袋利润）。今日由：</div>
            <span className={`stk__edge ${cur.cashFrom === 'sell' ? 'sell' : 'keep'}`}>
              {cur.cashFrom === 'sell' ? `今日卖出（+${cur.price}）` : '继续空仓（不动）'}
            </span>
          </div>
        </div>
      </div>

      {/* ③ 读数 + 步进 */}
      <div className="stk__readout">
        走到第 {clampDay(day)} 天，空仓最优现金 = <b>{fmt(cur.cash)}</b>。
        {clampDay(day) === prices.length ? (
          <>
            {' '}
            全程结束——最终答案取<strong>空仓</strong>态（手里不留股才算落袋）：<b>{fmt(days[prices.length - 1].cash)}</b>。
            {!cooldown && (
              <>
                {' '}
                与「逢涨就吃」贪心核对：无限次交易最优利润 = <b>{naiveBest}</b>，两者一致。
              </>
            )}
          </>
        ) : (
          <> 继续往后走，看两状态如何随每天买 / 卖 / 不动而更新。</>
        )}
      </div>
      <div className="stk__ctl">
        <div className="stk__ctl-btns">
          <button onClick={() => setDay(1)} aria-label="回到第一天" title="回到第一天">
            <RotateCcw size={17} />
          </button>
          <button onClick={() => setDay((d) => clampDay(d - 1))} disabled={clampDay(day) <= 1} aria-label="前一天">
            <ChevronLeft size={19} />
          </button>
          <button
            className="primary"
            onClick={() => setDay((d) => clampDay(d + 1))}
            disabled={clampDay(day) >= prices.length}
            aria-label="后一天"
          >
            <ChevronRight size={19} />
          </button>
        </div>
        <span className="stk__ctl-count">
          第 {clampDay(day)} / {prices.length} 天
        </span>
      </div>
    </div>
  )
}
