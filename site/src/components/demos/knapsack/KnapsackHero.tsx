import completeHeroArt from '../../../assets/demo-art/knapsack-complete-instrument-v1.avif'
import zeroOneHeroArt from '../../../assets/demo-art/knapsack-01-instrument-v2.avif'

const HERO_ART = {
  '01': zeroOneHeroArt,
  complete: completeHeroArt,
} as const

/**
 * 纯装饰 Hero：只负责课程气质，不映射输入、容量或播放状态。
 * 教学数据与交互全部留在编辑器和 DPViz 中。
 */
export function KnapsackHero({ variant = '01' }: { variant?: keyof typeof HERO_ART }) {
  return (
    <figure className="knapsack-hero" data-variant={variant} aria-hidden="true">
      <img
        src={HERO_ART[variant]}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </figure>
  )
}
