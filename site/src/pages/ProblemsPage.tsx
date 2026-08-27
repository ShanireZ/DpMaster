import { useDeferredValue, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ExternalLink } from 'lucide-react'
import AnimatedContent from '../components/motion/AnimatedContent'
import { PROBLEMS } from '../data/problems'
import { PARTS } from '../data/catalog'
import { trackAnalyticsEvent } from '../analytics/index.ts'
import './problems.css'

const PAGE_SIZE = 30

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
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedPart = searchParams.get('part') || 'all'
  const part = requestedPart === 'all' || PARTS.some((item) => item.id === requestedPart)
    ? requestedPart
    : 'all'
  const requestedKind = searchParams.get('kind')
  const kind: 'all' | 'example' | 'exercise' =
    requestedKind === 'example' || requestedKind === 'exercise' ? requestedKind : 'all'
  const q = (searchParams.get('q') || '').slice(0, 80)
  const deferredQ = useDeferredValue(q)
  const lastSearchEvent = useRef('')

  const updateParams = (
    changes: Record<string, string>,
    options: { resetPage?: boolean } = { resetPage: true },
  ) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (!value || value === 'all' || (key === 'page' && value === '1')) next.delete(key)
      else next.set(key, value)
    }
    if (options.resetPage !== false) next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    const query = deferredQ.trim().toLowerCase()
    return PROBLEMS.filter((p) => {
      if (part !== 'all' && p.part !== part) return false
      if (kind !== 'all' && p.kind !== kind) return false
      if (query && !`${p.pid} ${p.name} ${p.typeTitle}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [part, kind, deferredQ])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10)
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((value) => value === 1 || value === totalPages || Math.abs(value - page) <= 2)

  useEffect(() => {
    const search = deferredQ.trim()
    if (search.length < 2 || lastSearchEvent.current === search) return
    lastSearchEvent.current = search
    trackAnalyticsEvent({
      event: filtered.length === 0 ? 'search_no_result' : 'search_used',
      path: '/problems',
      metadata: { queryLength: search.length, results: filtered.length },
    })
  }, [deferredQ, filtered.length])

  const exCount = PROBLEMS.filter((p) => p.kind === 'example').length
  const uniqueCount = new Set(PROBLEMS.map((p) => p.pid)).size
  const readyParts = PARTS.filter((p) => p.types.some((t) => t.status === 'ready'))

  return (
    <div className="problems">
      <AnimatedContent>
        <section className="problems-hero">
          <span className="problems-hero__eyebrow">题库</span>
          <h1>题目索引</h1>
          <p className="problems-hero__lead">
            全站 {PROBLEMS.length} 个学习条目（例题 {exCount} · 练习 {PROBLEMS.length - exCount} · 去重后 {uniqueCount} 道题），全部洛谷原生。
            点题号去洛谷提交，点类型进对应讲解。
          </p>
        </section>
      </AnimatedContent>

      <div className="problems-toolbar">
        <label className="problems-search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => updateParams({ q: e.target.value })}
            placeholder="搜题号 / 题名 / 类型…"
            aria-label="搜索题目"
          />
        </label>
        <div className="problems-chips">
          <button type="button" className={`chip${part === 'all' ? ' on' : ''}`} onClick={() => updateParams({ part: 'all' })}>
            全部家族
          </button>
          {readyParts.map((p) => (
            <button
              type="button"
              key={p.id}
              className={`chip${part === p.id ? ' on' : ''}`}
              onClick={() => updateParams({ part: p.id })}
            >
              {p.code} · {p.title}
            </button>
          ))}
        </div>
        <div className="problems-chips">
          {KINDS.map((k) => (
            <button
              type="button"
              key={k.k}
              className={`chip${kind === k.k ? ' on' : ''}`}
              onClick={() => updateParams({ kind: k.k })}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div className="problems-count" role="status">
        {filtered.length} 个条目
        {filtered.length > PAGE_SIZE && ` · 第 ${page} / ${totalPages} 页`}
      </div>

      <AnimatedContent
        key={`${part}-${kind}-${deferredQ}-${page}`}
        distance={10}
        delay={0.02}
      >
        <div className="problems-list">
          {visible.map((p, i) => (
            <div className="prob" key={`${p.pid}-${p.part}-${p.slug}-${i}`}>
            <a
              className="prob__pid"
              href={`https://www.luogu.com.cn/problem/${p.pid}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackAnalyticsEvent({
                event: 'problem_outbound',
                path: '/problems',
                metadata: { problem: p.pid, part: p.part },
              })}
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
      </AnimatedContent>

      {filtered.length > PAGE_SIZE && (
        <nav className="problems-pagination" aria-label="题库分页">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => updateParams({ page: String(page - 1) }, { resetPage: false })}
          >
            上一页
          </button>
          <div className="problems-pagination__pages">
            {pageNumbers.map((value, index) => {
              const previous = pageNumbers[index - 1]
              return (
                <span key={value} className="problems-pagination__item">
                  {previous && value - previous > 1 && <span aria-hidden="true">…</span>}
                  <button
                    type="button"
                    className={value === page ? 'current' : ''}
                    aria-current={value === page ? 'page' : undefined}
                    onClick={() => updateParams({ page: String(value) }, { resetPage: false })}
                  >
                    {value}
                  </button>
                </span>
              )
            })}
          </div>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => updateParams({ page: String(page + 1) }, { resetPage: false })}
          >
            下一页
          </button>
        </nav>
      )}
    </div>
  )
}
