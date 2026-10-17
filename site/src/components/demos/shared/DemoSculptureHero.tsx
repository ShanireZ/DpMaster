import './demo-sculpture-hero.css'

export interface DemoSculptureHeroProps {
  family: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
  lesson: string
  src: string
}

/**
 * 每門課程的純裝飾雕塑。演算法輸入、狀態和播放影格必須繼續留在下方 Demo 中。
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
