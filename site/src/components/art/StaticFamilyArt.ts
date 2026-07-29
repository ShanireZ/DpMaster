import { createContext, useContext } from 'react'
import type { StaticFamilyArtModules } from './familyArtRegistry.ts'

export const StaticFamilyArtContext = createContext<StaticFamilyArtModules | undefined>(
  undefined,
)

export function useStaticFamilyArt() {
  return useContext(StaticFamilyArtContext)
}
