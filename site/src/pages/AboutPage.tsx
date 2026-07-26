import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { SlidersHorizontal, Gamepad2, PanelLeft, SunMoon, Sparkles, ArrowRight } from 'lucide-react'
import GeometryBackdrop from '../components/GeometryBackdrop'
import AnimatedContent from '../components/motion/AnimatedContent'
import { PARTS } from '../data/catalog'
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
      <AnimatedContent>
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
            DP大师围绕动态规划的七大家族展开，每个类型都配可改值的演示动画与互动小游戏，
            让状态、转移与无后效性在你眼前一格一格地长出来。例题全部取自洛谷原生题库。
          </p>
        </section>
      </AnimatedContent>

      <AnimatedContent delay={0.04}>
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
      </AnimatedContent>

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
            <a href="https://www.luogu.com.cn" target="_blank" rel="noopener noreferrer">
              洛谷
            </a>{' '}
            原生题库（P / B 题），按难度与家族逐题精选。
          </li>
          <li>
            <b>字体</b>：Space Grotesk / JetBrains Mono 自托管，中文正文走 Noto Sans SC / 微软雅黑等系统字体栈。
          </li>
          <li>
            <b>图标</b> Lucide（MIT）·<b>公式</b> KaTeX ·<b>代码高亮</b> Shiki——公式在组件中渲染，代码高亮按需懒加载。
          </li>
          <li>本站为教学用途，非商业项目。</li>
        </ul>
        <p className="about-feedback">有建议或发现错误？点右下角的反馈按钮告诉我们。</p>
      </section>

      <section className="about-block about-policy" id="privacy">
        <h2 className="about-block__title">隐私与反馈说明</h2>
        <p>
          反馈表单只在你主动提交时发送数据。必需字段包括反馈类型、当前页面名称与路径、具体描述和提交时间；
          复现步骤与联系方式均可留空。完整网址、浏览器标识和视口尺寸属于诊断信息，默认关闭，只有你勾选后才会附带。
        </p>
        <p>
          提交成功仅在维护通道确认接收后显示，并提供回执编号；通道不可用时页面会明确提示失败，不会把“仅写入日志”冒充送达。
          Web Vitals 与使用事件只记录页面路径、事件类别和性能数值，不采集姓名、联系方式或输入内容。
        </p>
        <p>
          反馈内容用于定位错误、回复建议和改进课程。运行日志的保存期限由部署平台配置，维护策略应设为不超过 30 天；
          需要删除曾提交的联系方式时，可在新反馈中附上原回执编号提出请求。
        </p>
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
