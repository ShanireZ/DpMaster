import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import GeometryBackdrop from '../components/GeometryBackdrop'
import PartGlyph from '../components/PartGlyph'
import { PARTS } from '../data/catalog'
import './home.css'

const SPAN: Record<string, string> = { a: 's6', b: 's6', c: 's4', d: 's4', e: 's4', f: 's6', g: 's6' }

export default function Home() {
  return (
    <div>
      <section className="hero">
        <GeometryBackdrop variant="hero" />
        <span className="hero__eyebrow">
          <Sparkles size={14} /> 动态规划 · 交互式教程
        </span>
        <h1>
          把 DP 变成<br />
          <span className="grad-text-brand">看得见的推演</span>
        </h1>
        <p className="hero__lead">
          七大 DP 家族，每个类型都配可改值的演示动画与互动小游戏——状态、转移、无后效性，
          在你眼前一格一格地长出来。例题全部取自洛谷原生题库。
        </p>
        <div className="hero__cta">
          <Link to="/part/a/01" className="btn btn--primary">
            从 01 背包开始 <ArrowRight size={18} />
          </Link>
          <Link to="/method" className="btn btn--ghost">
            先读方法论
          </Link>
        </div>
      </section>

      <section className="panorama">
        <div className="panorama__head">
          <h2>
            七大 <span className="grad-text-brand">DP 家族</span>
          </h2>
          <p>点击任一家族，进入它的类型、演示与题库。</p>
        </div>

        <div className="bento">
          {PARTS.map((p) => {
            const ready = p.types.filter((t) => t.status === 'ready').length
            return (
              <Link
                key={p.id}
                to={`/part/${p.id}`}
                className={`ptile ${SPAN[p.id]}`}
                style={
                  {
                    '--tile-grad': `var(--grad-${p.id})`,
                    '--tile-c1': `var(--${p.id}-1)`,
                  } as CSSProperties
                }
              >
                <div className="ptile__glyph">
                  <PartGlyph id={p.id} size={150} />
                </div>
                <span className="ptile__code">{p.code}</span>
                <h3 className="ptile__title">{p.title}</h3>
                <p className="ptile__motif">{p.motif}</p>
                <div className="ptile__meta">
                  <span className="ptile__dot" />
                  {p.types.length} 个类型
                  {ready > 0 && <span>· {ready} 个已上线</span>}
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
