import PolygonBackpack, { KnapsackLessonPlate } from '../PolygonBackpack.tsx'
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
  return (
    <PolygonBackpack
      className={className}
      dataFamilyArt="a"
      dataFamilyMode="journey"
      mode="wireframe"
    />
  )
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
