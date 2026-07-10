import type { Arrow, CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { normalizePalindromeInput } from '../../../algorithms/palindrome/index.ts'
import { recordPalindromeInsertion, recordPalindromeLps } from '../../../algorithms/palindrome/internal.ts'

function settled(table: (number | null)[][]): Record<string, CellState> {
  const states: Record<string, CellState> = {}
  for (let row = 0; row < table.length; row++) {
    for (let column = row; column < table.length; column++) {
      if (table[row][column] !== null) states[key(row, column)] = 'settled'
    }
  }
  return states
}

export function normalize(raw: string): string[] {
  return normalizePalindromeInput(raw)
}

export function palindromeLps(chars: string[]): VizModel {
  const run = recordPalindromeLps(chars)
  const n = chars.length
  const table = Array.from({ length: n }, () => Array<number | null>(n).fill(null))
  for (let index = 0; index < n; index++) table[index][index] = 1
  const snapshot = () => table.map((row) => row.slice())
  const frames: Frame[] = [{
    values: snapshot(),
    states: settled(table),
    caption: '<b>对角线（区间长度 1）</b>：单个字符自成回文，dp[i][i]=1。',
    formula: 'dp[i][i]=1',
  }]
  for (const event of run.events) {
    table[event.left][event.right] = event.value
    const states = settled(table)
    const arrows: Arrow[] = []
    let caption: string
    let formula: string
    if (event.matched) {
      if (event.right - event.left > 1) {
        states[key(event.left + 1, event.right - 1)] = 'chosen'
        arrows.push({ from: { r: event.left + 1, c: event.right - 1 }, to: { r: event.left, c: event.right }, kind: 'chosen' })
      }
      caption = `区间 <b>[${event.left},${event.right}]</b> 两端字符相等，把内层回文包起来：${event.inner}+2=<b>${event.value}</b>。`
      formula = `dp[${event.left}][${event.right}]=${event.inner}+2=${event.value}`
    } else {
      const source = event.source === 'left'
        ? { r: event.left + 1, c: event.right }
        : { r: event.left, c: event.right - 1 }
      states[key(source.r, source.c)] = 'chosen'
      arrows.push({ from: source, to: { r: event.left, c: event.right }, kind: 'chosen' })
      caption = `区间 <b>[${event.left},${event.right}]</b> 两端不同，比较丢左 ${event.dropLeft} 与丢右 ${event.dropRight}，取大得 <b>${event.value}</b>。`
      formula = `dp[${event.left}][${event.right}]=\\max(${event.dropLeft},${event.dropRight})=${event.value}`
    }
    states[key(event.left, event.right)] = 'current'
    frames.push({ values: snapshot(), states, arrows, active: { r: event.left, c: event.right }, caption, formula })
  }
  const finalStates = settled(table)
  if (n > 0) finalStates[key(0, n - 1)] = 'chosen'
  frames.push({
    values: snapshot(),
    states: finalStates,
    caption: `整串 "${chars.join('')}" 的最长回文子序列长度是 <b>${run.result.length}</b>。`,
    formula: `dp[0][${n - 1}]=${run.result.length}`,
  })
  return {
    rows: n,
    cols: n,
    cell: 42,
    rowHeaderLabels: chars.map((char, index) => `i=${index}·${char}`),
    colHeaderLabels: chars.map((char, index) => `j=${index}·${char}`),
    frames,
  }
}

export interface InsertStep {
  i: number
  j: number
  matched: boolean
  insertChar?: string
  insertSide?: 'left' | 'right'
  built: string
}

export interface InsertResult {
  chars: string[]
  insertCount: number
  lps: number
  palindrome: string
  steps: InsertStep[]
}

export function palindromeInsert(raw: string): InsertResult {
  const run = recordPalindromeInsertion(raw)
  const steps = run.events.map((event): InsertStep => ({
    i: event.left,
    j: event.right,
    matched: event.type === 'matched',
    insertChar: event.insertChar,
    insertSide: event.insertSide,
    built: event.built,
  }))
  return { ...run.result, steps }
}
