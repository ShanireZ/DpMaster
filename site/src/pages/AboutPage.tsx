import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { SlidersHorizontal, Gamepad2, PanelLeft, SunMoon, Sparkles, ArrowRight } from 'lucide-react'
import GeometryBackdrop from '../components/GeometryBackdrop'
import { PARTS } from '../data/parts'
import './about.css'

const USE = [
  {
    icon: SlidersHorizontal,
    title: '可改值的演示',
    desc: 'DP 表逐格填充，支持播放 / 单步 / 进度条拖动；改动输入会立即重跑求解、重播动画。',
  },
  {
    icon: Gamepad2,
    title: '互动小游戏',
    desc: '多数家族配一个小游戏（装包大师、LIS 接龙……），在玩中对照 DP 的最优决策。',
  },
  {
    icon: PanelLeft,
    title: '按家族浏览',
    desc: '左侧边栏把 DP 分成七大家族，每个类型自带推导、配图、例题与练习。',
  },
  {
    icon: SunMoon,
    title: '深浅两色',
    desc: '右上角一键切换暖墨深色与暖奶油浅色，长时间阅读不累眼。',
  },
]

export default function AboutPage() {
  const allTypes = PARTS.flatMap((p) => p.types)
  const ready = allTypes.filter((t) => t.status === 'ready').length

  return (
    <div className="about">
      <section className="about-hero">
        <GeometryBackdrop variant="section" />
        <span className="about-hero__eyebrow">
          <Sparkles size={14} /> 关于 · 如何使用
        </span>
        <h1>
          把动态规划
          <br />
          <span className="grad-text-brand">一格一格讲清楚</span>
        </h1>
        <p className="about-hero__lead">
          DP 图谱是一个动态规划交互式教程：七大家族、每个类型都配可改值的演示动画与互动小游戏，
          让状态、转移与无后效性在你眼前一格一格地长出来。例题全部取自洛谷原生题库。
        </p>
      </section>

      <section className="about-block">
        <h2 className="about-block__title">怎么用</h2>
        <div className="about-grid">
          {USE.map((u) => (
            <div className="about-card" key={u.title}>
              <span className="about-card__icon">
                <u.icon size={22} />
              </span>
              <h3>{u.title}</h3>
              <p>{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-block">
        <h2 className="about-block__title">覆盖范围</h2>
        <div className="about-stats">
          <div className="about-stat">
            <b>7</b>
            <span>大家族</span>
          </div>
          <div className="about-stat">
            <b>{allTypes.length}</b>
            <span>个类型</span>
          </div>
          <div className="about-stat">
            <b>{ready}</b>
            <span>已上线</span>
          </div>
          <div className="about-stat">
            <b>100%</b>
            <span>洛谷原生题</span>
          </div>
        </div>
        <div className="about-parts">
          {PARTS.map((p) => (
            <Link
              to={`/part/${p.id}`}
              key={p.id}
              className="about-part"
              style={{ ['--pg']: `var(--grad-${p.id})` } as CSSProperties}
            >
              <span className="about-part__code">{p.code}</span>
              <span className="about-part__title">{p.title}</span>
              <span className="about-part__n">{p.types.length}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-block">
        <h2 className="about-block__title">数据来源与许可</h2>
        <ul className="about-list">
          <li>
            <b>例题</b>：全部来自{' '}
            <a href="https://www.luogu.com.cn" target="_blank" rel="noreferrer">
              洛谷
            </a>{' '}
            原生题库（P / B 题），按难度与家族逐题精选。
          </li>
          <li>
            <b>字体</b>：思源黑体 / 得意黑 / Space Grotesk / JetBrains Mono，均 OFL 开源许可。
          </li>
          <li>
            <b>图标</b> Lucide（MIT）·<b>公式</b> KaTeX ·<b>代码高亮</b> Shiki——公式与高亮均构建期预渲染，运行时零负担。
          </li>
          <li>本站为教学用途，非商业项目。</li>
        </ul>
        <p className="about-feedback">有建议或发现错误？点右下角的反馈按钮告诉我们。</p>
      </section>

      <div className="about-cta">
        <Link to="/" className="about-btn about-btn--primary">
          回首页
        </Link>
        <Link to="/part/a/01" className="about-btn about-btn--ghost">
          从 01 背包开始 <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
