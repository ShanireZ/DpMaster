import heroArt from '../../../assets/demo-art/lcs-instrument-v1.avif'

/**
 * LCS 的纯装饰 Hero：保持两条序列与有序匹配桥的课程气质，
 * 但不映射当前字符串、DP 格子、回溯路径或播放状态。
 */
export function LCSHero() {
  return (
    <figure className="lcs-hero" data-demo-hero="lcs" aria-hidden="true">
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
