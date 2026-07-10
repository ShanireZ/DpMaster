import { bitmaskBits, bitmaskPopcount } from '../../../algorithms/bitmask-subset/index.ts'
import { recordBitmaskSubsets } from '../../../algorithms/bitmask-subset/internal.ts'

export interface SubsetStep {
  T: number
  step: number
  prevT: number
  isFirst: boolean
}

export function enumerateSubsets(source: number): SubsetStep[] {
  return recordBitmaskSubsets(source).events.map((event) => ({
    T: event.subset,
    step: event.step,
    prevT: event.previous,
    isFirst: event.first,
  }))
}

export function toBits(value: number, width: number): number[] {
  return bitmaskBits(value, width)
}

export function popcount(value: number): number {
  return bitmaskPopcount(value)
}
