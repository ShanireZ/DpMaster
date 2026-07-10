import { ignoreEvents } from '../contracts.ts'
import { executeIntegerPartition, executeStairCount } from './internal.ts'

export interface StairCountResult {
  count: number
  counts: number[]
}

export interface IntegerPartitionResult {
  count: number
  table: number[][]
}

export function solveStairCount(step: number): StairCountResult {
  return executeStairCount(step, ignoreEvents)
}

export function solveIntegerPartition(total: number): IntegerPartitionResult {
  return executeIntegerPartition(total, ignoreEvents)
}
