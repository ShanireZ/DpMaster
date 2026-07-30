import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, FlaskConical } from 'lucide-react'
import PartGlyph from '../components/PartGlyph'
import {
  FamilyHeroArt,
  FamilyJourneyArt,
} from '../components/art/FamilyArtSlots.tsx'
import { DeferredGame } from '../components/games/runtime/DeferredGame'
import AnimatedContent from '../components/motion/AnimatedContent'
import { getPart } from '../data/catalog'
import './part.css'

const NotFound = lazy(() => import('./NotFound'))

const BACKPACK_JOURNEY_GROUPS = new Map<number, { title: string; note: string }>([
  [0, { title: '物品件数', note: '从单件选择到混合调度' }],
  [5, { title: '约束结构', note: '容量从一维走向结构约束' }],
  [7, { title: '目标与边界', note: '改变目标，并辨清 DP 的边界' }],
])

export default function PartPage() {
  const { pid } = useParams()
  const part = pid ? getPart(pid) : undefined
  if (!part)
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    )

  const Game = part.game.content
  const firstLesson = part.types.find((type) => type.status === 'ready')

  return (
    <div className="partpage" data-part-id={part.id}>
      <AnimatedContent>
        <header className={`partcover partcover--${part.id}`}>
          <div className="partcover__frame">
            <div className="partcover__copy">
              <span className="partcover__code" aria-hidden="true">{part.code}</span>
              <h1>{part.title}</h1>
              <p className="partcover__tag">{part.tagline}</p>
              <div className="partcover__actions">
                {firstLesson && (
                  <Link to={`/part/${part.id}/${firstLesson.slug}`} className="partcover__primary">
                    从第一课开始 <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                )}
                <span className="partcover__count">{part.types.length} 门课程</span>
              </div>
            </div>
            <div className="partcover__art" aria-hidden="true">
              <FamilyHeroArt
                partId={part.id}
                className="partcover__family-art"
                fallback={(
                <>
                  <span className="partcover__ghost">{part.code}</span>
                  <span className="partcover__glyph">
                    <PartGlyph id={part.id} size={360} />
                  </span>
                </>
                )}
              />
            </div>
          </div>
        </header>
      </AnimatedContent>

      <AnimatedContent className="partjourney-wrap" delay={0.04}>
        <section className={`partjourney partjourney--${part.id}`} aria-labelledby="partjourney-title">
          <div className="partjourney__header">
            <h2 id="partjourney-title">沿状态路径学习</h2>
            <p>每一站只解决一个关键转移，前一站的直觉会成为下一站的起点。</p>
          </div>
          <div className="partjourney__body">
            <ol className="typepath">
              {part.types.map((type, index) => {
                const num = String(index + 1).padStart(2, '0')
                const journeyGroup = part.id === 'a'
                  ? BACKPACK_JOURNEY_GROUPS.get(index)
                  : undefined
                const title = type.title.startsWith(`${num} `)
                  ? type.title.slice(num.length + 1)
                  : type.title
                const content = (
                  <>
                    {journeyGroup && (
                      <span className="typewaypoint__group">
                        <strong>{journeyGroup.title}</strong>
                        <small>{journeyGroup.note}</small>
                      </span>
                    )}
                    <span className="typewaypoint__num">{num}</span>
                    <span className="typewaypoint__copy">
                      <span className="typewaypoint__title">{title}</span>
                      <span className="typewaypoint__blurb">{type.blurb}</span>
                    </span>
                    {type.status === 'ready' ? (
                      <span className="typewaypoint__arrow" aria-hidden="true">
                        <ArrowRight size={19} />
                      </span>
                    ) : (
                      <span className="typewaypoint__planned">待建</span>
                    )}
                  </>
                )

                return (
                  <li
                    key={type.slug}
                    data-journey-position={index + 1}
                    className={[
                      'typewaypoint',
                      `typewaypoint--pos-${index + 1}`,
                      journeyGroup ? 'typewaypoint--group-start' : '',
                      `typewaypoint--${part.id === 'a' || part.id === 'b' ? 'left' : (index % 2 === 0 ? 'left' : 'right')}`,
                    ].filter(Boolean).join(' ')}
                  >
                    {type.status === 'ready' ? (
                      <Link to={`/part/${part.id}/${type.slug}`} className="typewaypoint__link">
                        {content}
                      </Link>
                    ) : (
                      <div className="typewaypoint__link is-planned" aria-disabled="true">
                        {content}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
            <div className="partjourney__art" aria-hidden="true">
              <FamilyJourneyArt partId={part.id} />
            </div>
          </div>
        </section>
      </AnimatedContent>

      <AnimatedContent className="partlab-wrap" delay={0.04}>
        <section className="partlab" aria-labelledby="partlab-title">
          <header className="partlab__header">
            <span className="partlab__icon" aria-hidden="true">
              <FlaskConical size={34} />
            </span>
            <div>
              <h2 id="partlab-title">{part.id === 'a' ? '交互式实验室' : '状态实验室'}</h2>
              <p>在可视化环境里观察状态如何转移，再动手验证你的理解。</p>
            </div>
          </header>
          <div className="partlab__stage">
            <DeferredGame label={`${part.game.title}互动游戏`}>
              <Suspense fallback={<div className="deferred-game__loading" aria-busy="true" />}>
                <Game />
              </Suspense>
            </DeferredGame>
          </div>
        </section>
      </AnimatedContent>
    </div>
  )
}
