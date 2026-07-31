import type { PartId } from '../../../data/catalog.ts'

const REPRESENTATIVE_LESSONS = new Set<string>([
  'a/01',
  'a/dep',
  'b/lcs',
  'b/fsm',
  'c/stone',
  'c/ring',
  'd/grid',
  'd/matpow',
  'e/basic',
  'e/distsum',
  'f/knapsack',
  'f/cover',
  'g/board',
  'g/plug',
])

export function isRepresentativeLesson(partId: PartId, slug: string): boolean {
  return REPRESENTATIVE_LESSONS.has(`${partId}/${slug}`)
}

export const REPRESENTATIVE_LESSON_COUNT = REPRESENTATIVE_LESSONS.size
