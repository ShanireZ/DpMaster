import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { ArrowRight, ArrowUpRight, MoveHorizontal } from 'lucide-react'
import PartGlyph from '../components/PartGlyph'
import Magnet from '../components/motion/Magnet'
import { PARTS } from '../data/catalog'
import HomeMotionController from './HomeMotionController'
import './home.css'

type HeroTheme = 'dark' | 'light'

function readHeroTheme(): HeroTheme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function useHeroTheme() {
  const [theme, setTheme] = useState<HeroTheme>(readHeroTheme)

  useEffect(() => {
    const root = document.documentElement
    const syncTheme = () => setTheme(readHeroTheme())
    const observer = new MutationObserver(syncTheme)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    syncTheme()
    return () => observer.disconnect()
  }, [])

  return theme
}

/**
 * 首屏 hero 底图。它是 LCP 元素，所以刻意用 `<picture>` 而不是 CSS 背景 ——
 * `image-set()` 引用的图片不会被预加载扫描器发现，用在 LCP 候选上反而会拖慢
 * 加载。格式按「最优先在前」排：AVIF → WebP → JPEG，浏览器命中第一个支持的。
 *
 * ★ 两套主题是两份不同的美术处理（RMSE 0.87），不能靠滤镜合并成一张。
 * 预渲染产物固定输出 dark 版；light 主题的访客水合后会换成 light 版，
 * 但 index.html 的内联主题脚本已经按真实主题注入了 preload，届时直接命中缓存。
 */
function HeroImage({ theme }: { theme: HeroTheme }) {
  const base = theme === 'light' ? '/og/dpmaster-social-light' : '/og/dpmaster-social'
  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`${base}-760.avif 760w, ${base}.avif 1200w`}
        sizes="100vw"
      />
      <source
        type="image/webp"
        srcSet={`${base}-760.webp 760w, ${base}.webp 1200w`}
        sizes="100vw"
      />
      <img
        className="home-hero__image"
        src={`${base}.jpg`}
        alt=""
        width="1200"
        height="630"
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  )
}

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null)
  const heroTheme = useHeroTheme()
  const lessonTotal = PARTS.reduce((total, part) => total + part.types.length, 0)

  return (
    <div ref={rootRef} className="home">
      <HomeMotionController rootRef={rootRef} />

      <section className="home-hero" aria-labelledby="home-hero-title">
        <HeroImage theme={heroTheme} />
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
                      从此开始 <ArrowUpRight size={20} />
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
