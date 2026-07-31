import { describe, expect, it } from 'vitest'
import { isRepresentativeLesson, REPRESENTATIVE_LESSON_COUNT } from './lessonStandard.ts'

describe('representative lesson standard registry', () => {
  it('contains the approved fourteen lessons', () => {
    expect(REPRESENTATIVE_LESSON_COUNT).toBe(14)
    expect(isRepresentativeLesson('a', '01')).toBe(true)
    expect(isRepresentativeLesson('g', 'plug')).toBe(true)
    expect(isRepresentativeLesson('b', 'path')).toBe(false)
  })
})
