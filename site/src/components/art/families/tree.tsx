import treeHero from '../../../assets/family-art/tree-hero.webp'
import treeLessons from '../../../assets/family-art/tree-lessons.webp'
import { TreeJourneyArt } from '../CGFamilyArt.tsx'
import { PolyLessonPlate } from '../PolyLessonPlate.tsx'
import type { FamilyArtProps, LessonPlateProps } from '../familyArtRegistry.ts'

export function HeroArt({ className = '' }: FamilyArtProps) {
  return <img className={`family-poly-hero ${className}`.trim()} src={treeHero} alt="" aria-hidden="true" data-family-art="f" data-family-mode="hero" draggable={false} />
}

export function JourneyArt({ className = '' }: FamilyArtProps) {
  return <TreeJourneyArt className={className} />
}

export function LessonPlate({ slug, title, className = '' }: LessonPlateProps) {
  return <PolyLessonPlate family="f" atlas={treeLessons} slug={slug} title={title} className={className} />
}
