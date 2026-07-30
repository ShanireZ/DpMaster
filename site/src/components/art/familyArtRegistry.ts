import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { PartId } from '../../data/catalog.ts'

export interface FamilyArtProps {
  className?: string
}

export interface LessonPlateProps extends FamilyArtProps {
  slug: string
  title: string
}

export interface FamilyArtModule {
  HeroArt: ComponentType<FamilyArtProps>
  JourneyArt: ComponentType<FamilyArtProps>
  LessonPlate: ComponentType<LessonPlateProps>
}

export type ClientFamilyArtModule = {
  [Key in keyof FamilyArtModule]: LazyExoticComponent<FamilyArtModule[Key]>
}

interface FamilyArtRegistration {
  source: `src/components/art/families/${string}.tsx`
  load: () => Promise<FamilyArtModule>
}

function familyArt(
  id: PartId,
  source: FamilyArtRegistration['source'],
  load: FamilyArtRegistration['load'],
) {
  return [id, { source, load }] as const
}

const FAMILY_ART = Object.fromEntries([
  familyArt(
    'a',
    'src/components/art/families/backpack.tsx',
    () => import('./families/backpack.tsx'),
  ),
  familyArt(
    'b',
    'src/components/art/families/linear.tsx',
    () => import('./families/linear.tsx'),
  ),
]) as Partial<Record<PartId, FamilyArtRegistration>>

function lazyFamilyArt(registration: FamilyArtRegistration): ClientFamilyArtModule {
  return {
    HeroArt: lazy(() => registration.load().then(({ HeroArt }) => ({ default: HeroArt }))),
    JourneyArt: lazy(() => registration.load().then(({ JourneyArt }) => ({ default: JourneyArt }))),
    LessonPlate: lazy(() => registration.load().then(({ LessonPlate }) => ({ default: LessonPlate }))),
  }
}

export const CLIENT_FAMILY_ART = Object.fromEntries(
  Object.entries(FAMILY_ART).map(([partId, registration]) => [
    partId,
    lazyFamilyArt(registration),
  ]),
) as Partial<Record<PartId, ClientFamilyArtModule>>

export function hasFamilyArt(partId: PartId): boolean {
  return FAMILY_ART[partId] !== undefined
}

export function getFamilyArtSource(partId: PartId): string | undefined {
  return FAMILY_ART[partId]?.source
}

export async function loadFamilyArt(partId: PartId): Promise<FamilyArtModule | undefined> {
  return FAMILY_ART[partId]?.load()
}

export type StaticFamilyArtModules = Readonly<Partial<Record<PartId, FamilyArtModule>>>

export async function loadFamilyArtForPath(pathname: string): Promise<StaticFamilyArtModules> {
  const match = pathname.match(/^\/part\/([a-g])(?:\/|$)/)
  if (!match) return {}
  const partId = match[1] as PartId
  const module = await loadFamilyArt(partId)
  return module ? { [partId]: module } : {}
}
