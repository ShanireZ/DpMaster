import { ignoreEvents } from '../contracts.ts'
import {
  executePalindromeInsertion,
  executePalindromeLps,
  normalizePalindromeInput as normalizeInput,
} from './internal.ts'

export interface PalindromeLpsResult {
  length: number
  table: number[][]
}

export interface PalindromeInsertionResult {
  chars: string[]
  insertCount: number
  lps: number
  palindrome: string
}

export function normalizePalindromeInput(raw: string): string[] {
  return normalizeInput(raw)
}

export function solvePalindromeLps(chars: readonly string[]): PalindromeLpsResult {
  return executePalindromeLps(chars, ignoreEvents)
}

export function solvePalindromeInsertion(raw: string): PalindromeInsertionResult {
  return executePalindromeInsertion(raw, ignoreEvents)
}
