import type { ReactNode } from 'react'
import {
  StaticLessonContentContext,
  type StaticLessonContents,
} from './StaticLessonContent.ts'

export function StaticLessonContentProvider({
  children,
  contents,
}: {
  children: ReactNode
  contents: StaticLessonContents
}) {
  return (
    <StaticLessonContentContext value={contents}>
      {children}
    </StaticLessonContentContext>
  )
}
