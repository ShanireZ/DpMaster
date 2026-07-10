import type { EventSink, RecordedRun } from '../contracts.ts'
import type {
  DependencyAccessory, DependencyCombo, DependencyKnapsackResult, DependencyMaster,
} from './index.ts'

export interface DependencyCellEvent {
  type: 'cell'
  capacity: number
  skip: number
  bestTake: number | null
  takeIndex: number
  best: number
  takeWins: boolean
}

export function enumerateDependencyCombos(
  master: Readonly<DependencyMaster>,
  accessories: readonly DependencyAccessory[],
): DependencyCombo[] {
  const combos: DependencyCombo[] = []
  for (let mask = 0; mask < 1 << accessories.length; mask++) {
    let w = master.w
    let v = master.v
    const picks: boolean[] = []
    const selected: number[] = []
    for (let index = 0; index < accessories.length; index++) {
      const take = (mask & (1 << index)) !== 0
      picks.push(take)
      if (!take) continue
      w += accessories[index].w
      v += accessories[index].v
      selected.push(index + 1)
    }
    combos.push({ w, v, picks, label: selected.length === 0 ? '仅主' : `主+附${selected.join('')}` })
  }
  return combos
}

export function executeDependencyKnapsack(
  master: Readonly<DependencyMaster>,
  accessories: readonly DependencyAccessory[],
  capacity: number,
  emit: EventSink<DependencyCellEvent>,
): DependencyKnapsackResult {
  const combos = enumerateDependencyCombos(master, accessories)
  const table = [Array<number>(capacity + 1).fill(0), Array<number>(capacity + 1).fill(0)]
  for (let currentCapacity = 0; currentCapacity <= capacity; currentCapacity++) {
    const skip = table[0][currentCapacity]
    let bestTake: number | null = null
    let takeIndex = -1
    for (let index = 0; index < combos.length; index++) {
      const combo = combos[index]
      if (currentCapacity < combo.w) continue
      const candidate = table[0][currentCapacity - combo.w] + combo.v
      if (bestTake === null || candidate > bestTake) {
        bestTake = candidate
        takeIndex = index
      }
    }
    const best = bestTake !== null && bestTake > skip ? bestTake : skip
    const takeWins = bestTake !== null && bestTake > skip
    table[1][currentCapacity] = best
    emit({ type: 'cell', capacity: currentCapacity, skip, bestTake, takeIndex, best, takeWins })
  }
  const value = table[1][capacity]
  const bestCombo = combos.find((combo) => combo.w <= capacity && combo.v === value) ?? null
  return { value, table, combos, bestCombo }
}

export function recordDependencyKnapsack(
  master: Readonly<DependencyMaster>,
  accessories: readonly DependencyAccessory[],
  capacity: number,
): RecordedRun<DependencyKnapsackResult, DependencyCellEvent> {
  const events: DependencyCellEvent[] = []
  const result = executeDependencyKnapsack(master, accessories, capacity, (event) => events.push(event))
  return { result, events }
}
