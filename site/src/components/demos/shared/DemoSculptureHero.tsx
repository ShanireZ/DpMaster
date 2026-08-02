import './demo-sculpture-hero.css'

export interface DemoSculptureHeroProps {
  family: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
  lesson: string
  src: string
}

/**
 * 每门课程的纯装饰雕塑。算法输入、状态和播放帧必须继续留在下方 Demo 中。
 */
export function DemoSculptureHero({ family, lesson, src }: DemoSculptureHeroProps) {
  return (
    <div
      className="demo-sculpture-hero"
      data-demo-hero={lesson}
      data-family={family}
      aria-hidden="true"
    >
      <img src={src} alt="" draggable={false} />
    </div>
  )
}
