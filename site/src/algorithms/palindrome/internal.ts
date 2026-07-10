import type { EventSink, RecordedRun } from '../contracts.ts'
import type { PalindromeInsertionResult, PalindromeLpsResult } from './index.ts'

export interface PalindromeLpsEvent {
  type: 'settled'
  left: number
  right: number
  matched: boolean
  value: number
  inner: number
  dropLeft: number
  dropRight: number
  source: 'inner' | 'left' | 'right'
}

export interface PalindromeInsertionEvent {
  type: 'matched' | 'inserted'
  left: number
  right: number
  insertChar?: string
  insertSide?: 'left' | 'right'
  built: string
}

export function normalizePalindromeInput(raw: string): string[] {
  const chars = raw.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8).split('')
  return chars.length > 0 ? chars : ['a']
}

export function executePalindromeLps(
  chars: readonly string[],
  emit: EventSink<PalindromeLpsEvent>,
): PalindromeLpsResult {
  const n = chars.length
  const table = Array.from({ length: n }, () => Array<number>(n).fill(0))
  for (let index = 0; index < n; index++) table[index][index] = 1
  for (let length = 2; length <= n; length++) {
    for (let left = 0; left + length <= n; left++) {
      const right = left + length - 1
      const matched = chars[left] === chars[right]
      const inner = length === 2 ? 0 : table[left + 1][right - 1]
      const dropLeft = table[left + 1][right]
      const dropRight = table[left][right - 1]
      let source: PalindromeLpsEvent['source']
      if (matched) {
        table[left][right] = inner + 2
        source = 'inner'
      } else if (dropLeft >= dropRight) {
        table[left][right] = dropLeft
        source = 'left'
      } else {
        table[left][right] = dropRight
        source = 'right'
      }
      emit({
        type: 'settled',
        left,
        right,
        matched,
        value: table[left][right],
        inner,
        dropLeft,
        dropRight,
        source,
      })
    }
  }
  return { length: n === 0 ? 0 : table[0][n - 1], table }
}

export function recordPalindromeLps(
  chars: readonly string[],
): RecordedRun<PalindromeLpsResult, PalindromeLpsEvent> {
  const events: PalindromeLpsEvent[] = []
  const result = executePalindromeLps(chars, (event) => events.push(event))
  return { result, events }
}

export function executePalindromeInsertion(
  raw: string,
  emit: EventSink<PalindromeInsertionEvent>,
): PalindromeInsertionResult {
  const chars = normalizePalindromeInput(raw)
  const n = chars.length
  const table = Array.from({ length: n }, () => Array<number>(n).fill(0))
  for (let length = 2; length <= n; length++) {
    for (let left = 0; left + length <= n; left++) {
      const right = left + length - 1
      table[left][right] = chars[left] === chars[right]
        ? (length === 2 ? 0 : table[left + 1][right - 1])
        : Math.min(table[left + 1][right], table[left][right - 1]) + 1
    }
  }

  const leftHalf: string[] = []
  const rightHalf: string[] = []
  const shell = () => leftHalf.join('') + '…' + rightHalf.slice().reverse().join('')
  let left = 0
  let right = n - 1
  while (left < right) {
    if (chars[left] === chars[right]) {
      leftHalf.push(chars[left])
      rightHalf.push(chars[right])
      emit({ type: 'matched', left, right, built: shell() })
      left++
      right--
    } else if (table[left + 1][right] <= table[left][right - 1]) {
      leftHalf.push(chars[left])
      rightHalf.push(chars[left])
      emit({ type: 'inserted', left, right, insertChar: chars[left], insertSide: 'right', built: shell() })
      left++
    } else {
      leftHalf.push(chars[right])
      rightHalf.push(chars[right])
      emit({ type: 'inserted', left, right, insertChar: chars[right], insertSide: 'left', built: shell() })
      right--
    }
  }
  const center = left === right ? chars[left] : ''
  const palindrome = leftHalf.join('') + center + rightHalf.slice().reverse().join('')
  const insertCount = table[0][n - 1]
  return { chars, insertCount, lps: n - insertCount, palindrome }
}

export function recordPalindromeInsertion(
  raw: string,
): RecordedRun<PalindromeInsertionResult, PalindromeInsertionEvent> {
  const events: PalindromeInsertionEvent[] = []
  const result = executePalindromeInsertion(raw, (event) => events.push(event))
  return { result, events }
}
