import { createContext, useContext, type ComponentType } from 'react'

export type StaticLessonContents = Readonly<Record<string, ComponentType>>

export const StaticLessonContentContext = createContext<
  StaticLessonContents | undefined
>(undefined)

export function useStaticLessonContents() {
  return useContext(StaticLessonContentContext)
}
