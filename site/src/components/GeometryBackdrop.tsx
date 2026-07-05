import './GeometryBackdrop.css'

interface Props {
  variant?: 'hero' | 'section'
}

/** 几何动态渐变背景：随当前部分强调色变色的漂移光斑 + 网格 + 颗粒。
 *  纯 CSS 动画（transform/opacity），笔记本友好；prefers-reduced-motion 全局降级。 */
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
