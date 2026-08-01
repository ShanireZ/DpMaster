import matrixHero from '../../../assets/family-art/matrix-hero.avif'
import matrixLessons from '../../../assets/family-art/matrix-lessons.avif'
import { MatrixJourneyArt } from '../CGFamilyArt.tsx'
import { PolyLessonPlate } from '../PolyLessonPlate.tsx'
import type { FamilyArtProps, LessonPlateProps } from '../familyArtRegistry.ts'

export function HeroArt({ className = '' }: FamilyArtProps) {
  return <img className={`family-poly-hero ${className}`.trim()} src={matrixHero} alt="" aria-hidden="true" data-family-art="d" data-family-mode="hero" draggable={false} />
}

export function JourneyArt({ className = '' }: FamilyArtProps) {
  return <MatrixJourneyArt className={className} />
}

export function LessonPlate({ slug, title, className = '' }: LessonPlateProps) {
  return <PolyLessonPlate family="d" atlas={matrixLessons} slug={slug} title={title} className={className} />
}
