import { ignoreEvents } from '../contracts.ts'
import { executeBitmaskSubsets } from './internal.ts'

export interface BitmaskSubsetResult {
  source: number
  subsets: number[]
}

export function solveBitmaskSubsets(source: number): BitmaskSubsetResult {
  return executeBitmaskSubsets(source, ignoreEvents)
}

export function bitmaskBits(value: number, width: number): number[] {
  return Array.from({ length: width }, (_, index) => (value >> index) & 1)
}

export function bitmaskPopcount(value: number): number {
  let count = 0
  while (value !== 0) {
    value &= value - 1
    count++
  }
  return count
}
