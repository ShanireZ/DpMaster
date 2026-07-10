import { ignoreEvents } from '../contracts.ts'
import { executeBitmaskTsp } from './internal.ts'

export interface BitmaskTspResult {
  distance: number
  end: number
  table: number[][]
}

export function solveBitmaskTsp(distances: readonly (readonly number[])[]): BitmaskTspResult {
  return executeBitmaskTsp(distances, ignoreEvents)
}

export function formatBitmask(mask: number, width: number): string {
  return mask.toString(2).padStart(width, '0')
}
