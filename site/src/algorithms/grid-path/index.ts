import { ignoreEvents } from '../contracts.ts'
import { executeGridPathCount, executeTrianglePath } from './internal.ts'

export interface TrianglePathResult {
  value: number
  table: number[][]
}

export interface GridPathCountResult {
  count: number
  table: number[][]
}

export function solveTrianglePath(triangle: readonly (readonly number[])[]): TrianglePathResult {
  return executeTrianglePath(triangle, ignoreEvents)
}

export function solveGridPathCount(
  rows: number,
  columns: number,
  blocked: ReadonlySet<string>,
): GridPathCountResult {
  return executeGridPathCount(rows, columns, blocked, ignoreEvents)
}
