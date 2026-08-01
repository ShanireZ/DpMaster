import intervalHero from '../../../assets/family-art/interval-hero.avif'
import intervalLessons from '../../../assets/family-art/interval-lessons.avif'
import { IntervalJourneyArt } from '../CGFamilyArt.tsx'
import { PolyLessonPlate } from '../PolyLessonPlate.tsx'
import type { FamilyArtProps, LessonPlateProps } from '../familyArtRegistry.ts'

export function HeroArt({ className = '' }: FamilyArtProps) {
  return <img className={`family-poly-hero ${className}`.trim()} src={intervalHero} alt="" aria-hidden="true" data-family-art="c" data-family-mode="hero" draggable={false} />
}

export function JourneyArt({ className = '' }: FamilyArtProps) {
  return <IntervalJourneyArt className={className} />
}

export function LessonPlate({ slug, title, className = '' }: LessonPlateProps) {
  return <PolyLessonPlate family="c" atlas={intervalLessons} slug={slug} title={title} className={className} />
}
