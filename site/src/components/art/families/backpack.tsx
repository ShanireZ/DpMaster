import backpackHeroImage from '../../../assets/family-art/backpack-hero.avif'
import backpackLessonAtlas from '../../../assets/family-art/knapsack-lessons.avif'
import BackpackJourneyMap from '../BackpackJourneyMap.tsx'
import { PolyLessonPlate } from '../PolyLessonPlate.tsx'
import type {
  FamilyArtProps,
  LessonPlateProps,
} from '../familyArtRegistry.ts'

export function HeroArt({ className = '' }: FamilyArtProps) {
  return (
    <img
      className={`poly-backpack poly-backpack--image ${className}`.trim()}
      src={backpackHeroImage}
      alt=""
      aria-hidden="true"
      data-family-art="a"
      data-family-mode="hero"
      draggable={false}
    />
  )
}

export function JourneyArt({ className = '' }: FamilyArtProps) {
  return <BackpackJourneyMap className={className} />
}

export function LessonPlate({ slug, title, className = '' }: LessonPlateProps) {
  return (
    <PolyLessonPlate
      family="a"
      atlas={backpackLessonAtlas}
      className={className}
      slug={slug}
      title={title}
    />
  )
}
