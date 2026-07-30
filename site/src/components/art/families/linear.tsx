import {
  LinearHeroArt,
  LinearJourneyArt,
  LinearLessonPlate,
} from '../LinearFamilyArt.tsx'
import type {
  FamilyArtProps,
  LessonPlateProps,
} from '../familyArtRegistry.ts'

export function HeroArt({ className = '' }: FamilyArtProps) {
  return <LinearHeroArt className={className} />
}

export function JourneyArt({ className = '' }: FamilyArtProps) {
  return <LinearJourneyArt className={className} />
}

export function LessonPlate({ slug, title, className = '' }: LessonPlateProps) {
  return <LinearLessonPlate slug={slug} title={title} className={className} />
}
