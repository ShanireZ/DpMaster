import backpackHeroImage from '../../../assets/family-art/backpack-hero.avif'
import { KnapsackLessonPlate } from '../PolygonBackpack.tsx'
import BackpackJourneyMap from '../BackpackJourneyMap.tsx'
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
    <KnapsackLessonPlate
      className={className}
      slug={slug}
      title={title}
    />
  )
}
