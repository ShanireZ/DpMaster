import heroArt from '../../../assets/demo-art/lcs-instrument-v1.avif'

/**
 * LCS 的純裝飾 Hero：保持兩條序列與有序匹配橋的課程氣質，
 * 但不映射當前字串、DP 格子、回溯路徑或播放狀態。
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
