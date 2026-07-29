import { Suspense, type ReactNode } from 'react'
import type { PartId } from '../../data/catalog.ts'
import { useStaticFamilyArt } from './StaticFamilyArt.ts'
import {
  CLIENT_FAMILY_ART,
  type FamilyArtProps,
  type LessonPlateProps,
} from './familyArtRegistry.ts'

interface FamilyArtSlotProps extends FamilyArtProps {
  partId: PartId
  fallback?: ReactNode
}

export function FamilyHeroArt({
  partId,
  fallback = null,
  ...props
}: FamilyArtSlotProps) {
  const staticArt = useStaticFamilyArt()?.[partId]
  const HeroArt = staticArt?.HeroArt ?? CLIENT_FAMILY_ART[partId]?.HeroArt
  if (!HeroArt) return fallback
  return <Suspense fallback={fallback}><HeroArt {...props} /></Suspense>
}

export function FamilyJourneyArt({
  partId,
  fallback = null,
  ...props
}: FamilyArtSlotProps) {
  const staticArt = useStaticFamilyArt()?.[partId]
  const JourneyArt = staticArt?.JourneyArt ?? CLIENT_FAMILY_ART[partId]?.JourneyArt
  if (!JourneyArt) return fallback
  return <Suspense fallback={fallback}><JourneyArt {...props} /></Suspense>
}

export function FamilyLessonPlate({
  partId,
  fallback = null,
  ...props
}: FamilyArtSlotProps & LessonPlateProps) {
  const staticArt = useStaticFamilyArt()?.[partId]
  const LessonPlate = staticArt?.LessonPlate ?? CLIENT_FAMILY_ART[partId]?.LessonPlate
  if (!LessonPlate) return fallback
  return <Suspense fallback={fallback}><LessonPlate {...props} /></Suspense>
}
