import { ignoreEvents } from '../contracts.ts'
import { executeEditDistance } from './internal.ts'

export interface EditDistanceResult {
  distance: number
  table: number[][]
}

export function solveEditDistance(source: string, target: string): EditDistanceResult {
  return executeEditDistance(source, target, ignoreEvents)
}
