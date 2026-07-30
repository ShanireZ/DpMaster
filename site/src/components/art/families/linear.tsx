import linearLessonAtlas from '../../../assets/family-art/linear-lessons.avif'
import {
  LinearHeroArt,
  LinearJourneyArt,
} from '../LinearFamilyArt.tsx'
import { PolyLessonPlate } from '../PolyLessonPlate.tsx'
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
  return (
    <PolyLessonPlate
      family="b"
      atlas={linearLessonAtlas}
      slug={slug}
      title={title}
      className={className}
    />
  )
}
