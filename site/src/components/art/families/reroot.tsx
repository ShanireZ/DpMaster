import rerootHero from '../../../assets/family-art/reroot-hero.avif'
import rerootLessons from '../../../assets/family-art/reroot-lessons.avif'
import { RerootJourneyArt } from '../CGFamilyArt.tsx'
import { PolyLessonPlate } from '../PolyLessonPlate.tsx'
import type { FamilyArtProps, LessonPlateProps } from '../familyArtRegistry.ts'

export function HeroArt({ className = '' }: FamilyArtProps) {
  return <img className={`family-poly-hero ${className}`.trim()} src={rerootHero} alt="" aria-hidden="true" data-family-art="e" data-family-mode="hero" draggable={false} />
}

export function JourneyArt({ className = '' }: FamilyArtProps) {
  return <RerootJourneyArt className={className} />
}

export function LessonPlate({ slug, title, className = '' }: LessonPlateProps) {
  return <PolyLessonPlate family="e" atlas={rerootLessons} slug={slug} title={title} className={className} />
}
