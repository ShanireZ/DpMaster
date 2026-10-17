import './GeometryBackdrop.css'

interface Props {
  variant?: 'hero' | 'section'
}

/** 幾何動態漸變背景：隨當前部分強調色變色的漂移光斑 + 網格 + 顆粒。
 *  純 CSS 動畫（transform/opacity），筆記本友好；prefers-reduced-motion 全域降級。 */
export default function GeometryBackdrop({ variant = 'section' }: Props) {
  return (
    <div className={`backdrop backdrop--${variant}`} aria-hidden="true">
      <div className="backdrop__blob b1" />
      <div className="backdrop__blob b2" />
      <div className="backdrop__blob b3" />
      <div className="backdrop__grid" />
      <div className="backdrop__grain" />
    </div>
  )
}
