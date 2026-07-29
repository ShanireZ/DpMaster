import type { ReactNode } from 'react'
import { StaticFamilyArtContext } from './StaticFamilyArt.ts'
import type { StaticFamilyArtModules } from './familyArtRegistry.ts'

export function StaticFamilyArtProvider({
  children,
  modules,
}: {
  children: ReactNode
  modules: StaticFamilyArtModules
}) {
  return (
    <StaticFamilyArtContext value={modules}>
      {children}
    </StaticFamilyArtContext>
  )
}
