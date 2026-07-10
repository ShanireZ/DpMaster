import { ignoreEvents } from '../contracts.ts'
import { executeLinearFsm, executeStockFsm } from './internal.ts'

export interface LinearFsmResult {
  value: number
  table: number[][]
  finalState: 0 | 1
}

export interface StockDay {
  day: number
  price: number
  hold: number
  cash: number
  holdFrom: 'hold' | 'buy'
  cashFrom: 'cash' | 'sell'
  froze: boolean
}

export interface StockFsmResult {
  profit: number
  days: StockDay[]
}

export function solveLinearFsm(values: readonly number[]): LinearFsmResult {
  return executeLinearFsm(values, ignoreEvents)
}

export function solveStockFsm(prices: readonly number[], cooldown: boolean): StockFsmResult {
  return executeStockFsm(prices, cooldown, ignoreEvents)
}
