import PolygonBackpack, { KnapsackLessonPlate } from '../PolygonBackpack.tsx'
import BackpackJourneyMap from '../BackpackJourneyMap.tsx'
import type {
  FamilyArtProps,
  LessonPlateProps,
} from '../familyArtRegistry.ts'

export function HeroArt({ className = '' }: FamilyArtProps) {
  return (
    <PolygonBackpack
      className={className}
      dataFamilyArt="a"
      dataFamilyMode="hero"
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
