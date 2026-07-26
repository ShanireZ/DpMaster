import { useRef } from 'react'
import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { ArrowRight, ArrowUpRight, MoveHorizontal } from 'lucide-react'
import PartGlyph from '../components/PartGlyph'
import Magnet from '../components/motion/Magnet'
import { PARTS } from '../data/catalog'
import HomeMotionController from './HomeMotionController'
import './home.css'

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null)
  const lessonTotal = PARTS.reduce((total, part) => total + part.types.length, 0)

  return (
    <div ref={rootRef} className="home">
      <HomeMotionController rootRef={rootRef} />

      <section className="home-hero" aria-labelledby="home-hero-title">
        <img
          className="home-hero__image"
          src="/og/dpmaster-social.jpg"
          alt=""
          width="1200"
          height="630"
          fetchPriority="high"
        />
        <div className="home-hero__shade" aria-hidden="true" />
        <div className="home-hero__frame">
          <div className="home-hero__content">
            <h1 id="home-hero-title">
              <span className="home-hero__line">
                <span data-home-line>把 DP 变成</span>
              </span>
              <span className="home-hero__line">
                <span data-home-line>看得见的推演</span>
              </span>
            </h1>
            <p className="home-hero__lead">
              从状态定义到模型迁移，用可改值演示和手算过程建立直觉。
            </p>
            <div className="home-hero__actions">
              <Magnet className="home-hero__magnet">
                <Link to="/part/a" className="home-hero__primary">
                  从背包 DP 开始 <ArrowRight size={18} />
                </Link>
              </Magnet>
              <Link to="/method" className="home-hero__secondary">
                先读方法论 <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="state-atlas"
        aria-labelledby="state-atlas-title"
        aria-describedby="state-atlas-instructions"
      >
        <div className="state-atlas__track">
          <div className="state-atlas__intro">
            <h2 id="state-atlas-title">
              七种
              <span>状态空间</span>
            </h2>
            <p>
              {lessonTotal} 门课程沿七个 DP 家族展开，从状态含义进入，沿转移路径抵达答案。
            </p>
            <span className="state-atlas__gesture" id="state-atlas-instructions">
              <MoveHorizontal size={16} aria-hidden="true" />
              滚动或左右拖动浏览
            </span>
          </div>

          <ol className="family-scenes">
            {PARTS.map((part) => (
              <li
                className="family-scene"
                key={part.id}
                style={
                  {
                    '--family-color': `var(--${part.id}-1)`,
                    '--family-gradient': `var(--grad-${part.id})`,
                  } as CSSProperties
                }
              >
                <Link
                  to={`/part/${part.id}`}
                  className="family-scene__link"
                  draggable={false}
                  aria-label={`进入${part.title}，共 ${part.types.length} 个类型`}
                >
                  <span className="family-scene__code" aria-hidden="true">{part.code}</span>
                  <span className="family-scene__ghost" aria-hidden="true">{part.code}</span>
                  <span className="family-scene__glyph" aria-hidden="true">
                    <PartGlyph id={part.id} size={240} />
                  </span>
                  <span className="family-scene__copy">
                    <span className="family-scene__meta">{part.types.length} 个类型</span>
                    <h3>{part.title}</h3>
                    <span className="family-scene__tagline">{part.tagline}</span>
                    <span className="family-scene__action">
                      进入这一族 <ArrowUpRight size={20} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
