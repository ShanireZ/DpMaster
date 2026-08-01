import heroArt from '../../../assets/demo-art/knapsack-01-instrument.avif'

/**
 * 纯装饰 Hero：只负责课程气质，不映射输入、容量或播放状态。
 * 教学数据与交互全部留在编辑器和 DPViz 中。
 */
export function KnapsackHero() {
  return (
    <figure className="knapsack-hero" aria-hidden="true">
      <img
        src={heroArt}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </figure>
  )
}
