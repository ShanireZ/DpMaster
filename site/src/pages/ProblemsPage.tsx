import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ExternalLink } from 'lucide-react'
import { PROBLEMS } from '../data/problems'
import { PARTS } from '../data/parts'
import './problems.css'

const KINDS: { k: 'all' | 'example' | 'exercise'; label: string }[] = [
  { k: 'all', label: '全部' },
  { k: 'example', label: '例题' },
  { k: 'exercise', label: '练习' },
]

function diffTier(d: string): string {
  if (!d) return 'none'
  if (d.includes('入门')) return 't1'
  if (d.includes('省选') || d.includes('NOI')) return 't4'
  if (d.includes('提高')) return 't3'
  if (d.includes('普及')) return 't2'
  return 't2'
}

export default function ProblemsPage() {
  const [part, setPart] = useState<string>('all')
  const [kind, setKind] = useState<'all' | 'example' | 'exercise'>('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return PROBLEMS.filter((p) => {
      if (part !== 'all' && p.part !== part) return false
      if (kind !== 'all' && p.kind !== kind) return false
      if (query && !`${p.pid} ${p.name} ${p.typeTitle}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [part, kind, q])

  const exCount = PROBLEMS.filter((p) => p.kind === 'example').length
  const readyParts = PARTS.filter((p) => p.types.some((t) => t.status === 'ready'))

  return (
    <div className="problems">
      <section className="problems-hero">
        <span className="problems-hero__eyebrow">题库</span>
        <h1>题目索引</h1>
        <p className="problems-hero__lead">
          全站 {PROBLEMS.length} 道题（例题 {exCount} · 练习 {PROBLEMS.length - exCount}），全部洛谷原生。
          点题号去洛谷提交，点类型进对应讲解。
        </p>
      </section>

      <div className="problems-toolbar">
        <label className="problems-search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜题号 / 题名 / 类型…"
            aria-label="搜索题目"
          />
        </label>
        <div className="problems-chips">
          <button className={`chip${part === 'all' ? ' on' : ''}`} onClick={() => setPart('all')}>
            全部家族
          </button>
          {readyParts.map((p) => (
            <button
              key={p.id}
              className={`chip${part === p.id ? ' on' : ''}`}
              onClick={() => setPart(p.id)}
            >
              {p.code} · {p.title}
            </button>
          ))}
        </div>
        <div className="problems-chips">
          {KINDS.map((k) => (
            <button
              key={k.k}
              className={`chip${kind === k.k ? ' on' : ''}`}
              onClick={() => setKind(k.k)}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div className="problems-count">{filtered.length} 道</div>

      <div className="problems-list">
        {filtered.map((p, i) => (
          <div className="prob" key={`${p.pid}-${p.part}-${p.slug}-${i}`}>
            <a
              className="prob__pid"
              href={`https://www.luogu.com.cn/problem/${p.pid}`}
              target="_blank"
              rel="noreferrer"
            >
              {p.pid} <ExternalLink size={12} />
            </a>
            <span className="prob__name">{p.name}</span>
            {p.diff && (
              <span className="prob__diff" data-tier={diffTier(p.diff)}>
                {p.diff}
              </span>
            )}
            <Link className="prob__type" to={`/part/${p.part}/${p.slug}`}>
              {p.partTitle} · {p.typeTitle}
            </Link>
            <span className={`prob__kind prob__kind--${p.kind}`}>
              {p.kind === 'example' ? '例题' : '练习'}
            </span>
          </div>
        ))}
        {filtered.length === 0 && <div className="problems-empty">没有匹配的题目。</div>}
      </div>
    </div>
  )
}
