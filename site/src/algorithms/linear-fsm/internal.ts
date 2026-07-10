import type { EventSink, RecordedRun } from '../contracts.ts'
import type { LinearFsmResult, StockDay, StockFsmResult } from './index.ts'

export interface LinearFsmEvent {
  type: 'settled'
  position: number
  value: number
  previousSkip: number
  previousPick: number
  skip: number
  pick: number
  skipFrom: 0 | 1
}

export interface StockFsmEvent extends StockDay {
  type: 'settled'
}

function validateFinite(values: readonly number[], label: string): void {
  for (const value of values) if (!Number.isFinite(value)) throw new RangeError(`${label} values must be finite`)
}

export function executeLinearFsm(
  values: readonly number[],
  emit: EventSink<LinearFsmEvent>,
): LinearFsmResult {
  validateFinite(values, 'linear FSM')
  const table = Array.from({ length: 2 }, () => Array<number>(values.length + 1).fill(0))
  for (let position = 1; position <= values.length; position++) {
    const previousSkip = table[0][position - 1]
    const previousPick = table[1][position - 1]
    const skipFrom: 0 | 1 = previousSkip >= previousPick ? 0 : 1
    const skip = Math.max(previousSkip, previousPick)
    const pick = previousSkip + values[position - 1]
    table[0][position] = skip
    table[1][position] = pick
    emit({
      type: 'settled',
      position,
      value: values[position - 1],
      previousSkip,
      previousPick,
      skip,
      pick,
      skipFrom,
    })
  }
  const finalState: 0 | 1 = table[1][values.length] >= table[0][values.length] ? 1 : 0
  return { value: table[finalState][values.length], table, finalState }
}

export function recordLinearFsm(values: readonly number[]): RecordedRun<LinearFsmResult, LinearFsmEvent> {
  const events: LinearFsmEvent[] = []
  const result = executeLinearFsm(values, (event) => events.push(event))
  return { result, events }
}

export function executeStockFsm(
  prices: readonly number[],
  cooldown: boolean,
  emit: EventSink<StockFsmEvent>,
): StockFsmResult {
  validateFinite(prices, 'stock FSM')
  const days: StockDay[] = []
  let previousCash = 0
  let previousHold = Number.NEGATIVE_INFINITY
  let cashBeforePrevious = 0
  for (let index = 0; index < prices.length; index++) {
    const price = prices[index]
    const sell = previousHold + price
    const cash = Math.max(previousCash, sell)
    const cashFrom: StockDay['cashFrom'] = sell > previousCash ? 'sell' : 'cash'
    const buyBase = cooldown ? cashBeforePrevious : previousCash
    const buy = buyBase - price
    const hold = Math.max(previousHold, buy)
    const holdFrom: StockDay['holdFrom'] = buy > previousHold ? 'buy' : 'hold'
    const froze = cooldown && index >= 1 && days[index - 1].cashFrom === 'sell'
    const day: StockDay = { day: index + 1, price, hold, cash, holdFrom, cashFrom, froze }
    days.push(day)
    emit({ type: 'settled', ...day })
    cashBeforePrevious = previousCash
    previousCash = cash
    previousHold = hold
  }
  return { profit: previousCash, days }
}

export function recordStockFsm(
  prices: readonly number[],
  cooldown: boolean,
): RecordedRun<StockFsmResult, StockFsmEvent> {
  const events: StockFsmEvent[] = []
  const result = executeStockFsm(prices, cooldown, (event) => events.push(event))
  return { result, events }
}
