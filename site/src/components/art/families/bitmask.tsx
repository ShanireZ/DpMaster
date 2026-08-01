import bitmaskHero from '../../../assets/family-art/bitmask-hero.avif'
import bitmaskLessons from '../../../assets/family-art/bitmask-lessons.avif'
import { BitmaskJourneyArt } from '../CGFamilyArt.tsx'
import { PolyLessonPlate } from '../PolyLessonPlate.tsx'
import type { FamilyArtProps, LessonPlateProps } from '../familyArtRegistry.ts'

export function HeroArt({ className = '' }: FamilyArtProps) {
  return <img className={`family-poly-hero ${className}`.trim()} src={bitmaskHero} alt="" aria-hidden="true" data-family-art="g" data-family-mode="hero" draggable={false} />
}

export function JourneyArt({ className = '' }: FamilyArtProps) {
  return <BitmaskJourneyArt className={className} />
}

export function LessonPlate({ slug, title, className = '' }: LessonPlateProps) {
  return <PolyLessonPlate family="g" atlas={bitmaskLessons} slug={slug} title={title} className={className} />
}
