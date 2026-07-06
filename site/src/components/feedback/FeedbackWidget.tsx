import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageSquarePlus, X, Send, Check, Loader2 } from 'lucide-react'
import { getPart } from '../../data/parts'
import './feedback.css'

type Kind = '内容有误' | '显示异常' | '功能问题' | '建议' | '其他'
const KINDS: Kind[] = ['内容有误', '显示异常', '功能问题', '建议', '其他']

type Status = 'idle' | 'sending' | 'ok' | 'error'

/** 把当前路由翻成一个人话页面标签，便于反馈自动定位。 */
function pageLabel(pathname: string): string {
  const m = pathname.match(/^\/part\/([a-g])(?:\/([a-z0-9]+))?/)
  if (m) {
    const part = getPart(m[1])
    if (part) {
      const type = m[2] ? part.types.find((t) => t.slug === m[2]) : undefined
      return type ? `${part.code} ${part.title} · ${type.title}` : `${part.code} ${part.title}`
    }
  }
  if (pathname === '/' || pathname === '') return '首页'
  if (pathname.startsWith('/method')) return '方法论'
  return pathname
}

export default function FeedbackWidget() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<Kind>('内容有误')
  const [desc, setDesc] = useState('')
  const [steps, setSteps] = useState('')
  const [contact, setContact] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [copied, setCopied] = useState(false)
  const [page, setPage] = useState('')
  const descRef = useRef<HTMLTextAreaElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // 打开时快照当前页 + 聚焦描述框；Esc 关闭
  useEffect(() => {
    if (!open) return
    setPage(pageLabel(location.pathname))
    const t = setTimeout(() => descRef.current?.focus(), 40)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const reset = () => {
    setKind('内容有误')
    setDesc('')
    setSteps('')
    setContact('')
    setStatus('idle')
    setCopied(false)
  }
  const close = () => {
    setOpen(false)
    // 提交成功后关闭时清空，避免下次残留
    if (status === 'ok') setTimeout(reset, 200)
  }

  const payload = () => ({
    kind,
    page,
    path: location.pathname,
    description: desc.trim(),
    steps: steps.trim(),
    contact: contact.trim(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    viewport:
      typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : '',
    ts: new Date().toISOString(),
  })

  const asText = () => {
    const p = payload()
    return [
      `【DP 图谱 · 反馈】`,
      `类型：${p.kind}`,
      `页面：${p.page}（${p.path}）`,
      `描述：${p.description}`,
      p.steps && `复现/期望：${p.steps}`,
      p.contact && `联系方式：${p.contact}`,
      `环境：${p.viewport} · ${p.ua}`,
      `时间：${p.ts}`,
    ]
      .filter(Boolean)
      .join('\n')
  }

  const submit = async () => {
    if (desc.trim().length < 4) {
      descRef.current?.focus()
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('ok')
    } catch {
      // 后端未接通/网络失败：降级为「复制反馈」，让用户仍能把内容交出去
      setStatus('error')
    }
  }

  const copyFallback = async () => {
    try {
      await navigator.clipboard.writeText(asText())
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* 剪贴板不可用则忽略 */
    }
  }

  return (
    <>
      <button
        className="fbw__fab"
        onClick={() => setOpen(true)}
        aria-label="反馈问题或建议"
        title="反馈 / 报错"
      >
        <MessageSquarePlus size={18} />
        <span className="fbw__fab-label">反馈</span>
      </button>

      {open && (
        <div className="fbw__overlay" onMouseDown={close}>
          <div
            className="fbw__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fbw-title"
            ref={dialogRef}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="fbw__head">
              <h2 id="fbw-title" className="fbw__title">
                报告问题 · 提建议
              </h2>
              <button className="fbw__close" onClick={close} aria-label="关闭">
                <X size={18} />
              </button>
            </div>

            {status === 'ok' ? (
              <div className="fbw__done">
                <span className="fbw__done-icon">
                  <Check size={26} />
                </span>
                <p className="fbw__done-title">已收到，谢谢你！</p>
                <p className="fbw__done-sub">你的反馈会帮这份教程变得更准、更好。</p>
                <button className="fbw__btn fbw__btn--primary" onClick={close}>
                  完成
                </button>
              </div>
            ) : (
              <div className="fbw__body">
                <div className="fbw__field">
                  <label className="fbw__label">这是关于</label>
                  <div className="fbw__kinds">
                    {KINDS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        className={`fbw__kind${kind === k ? ' on' : ''}`}
                        onClick={() => setKind(k)}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="fbw__field">
                  <label className="fbw__label">
                    当前页面 <span className="fbw__hint">（自动带上，便于定位）</span>
                  </label>
                  <div className="fbw__page">{page}</div>
                </div>

                <div className="fbw__field">
                  <label className="fbw__label" htmlFor="fbw-desc">
                    具体问题 / 建议 <span className="fbw__req">*</span>
                  </label>
                  <textarea
                    id="fbw-desc"
                    ref={descRef}
                    className="fbw__textarea"
                    rows={4}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="例如：完全背包「跟着算一遍」第 2 步，f[4] 应为 6 不是 5；或某处公式没渲染、演示点了没反应……"
                    maxLength={2000}
                  />
                </div>

                <div className="fbw__field">
                  <label className="fbw__label" htmlFor="fbw-steps">
                    复现步骤 / 期望 <span className="fbw__hint">（选填）</span>
                  </label>
                  <textarea
                    id="fbw-steps"
                    className="fbw__textarea"
                    rows={2}
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    placeholder="怎么触发的、你期望是什么样"
                    maxLength={1000}
                  />
                </div>

                <div className="fbw__field">
                  <label className="fbw__label" htmlFor="fbw-contact">
                    联系方式 <span className="fbw__hint">（选填，便于回复）</span>
                  </label>
                  <input
                    id="fbw-contact"
                    className="fbw__input"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="邮箱 / QQ / 微信，可留空匿名"
                    maxLength={120}
                  />
                </div>

                {status === 'error' && (
                  <div className="fbw__error">
                    提交没成功（后端可能还没接通或网络问题）。你可以
                    <button type="button" className="fbw__link" onClick={copyFallback}>
                      {copied ? '已复制 ✓' : '复制反馈内容'}
                    </button>
                    ，再贴到反馈群 / 邮件里。
                  </div>
                )}

                <div className="fbw__actions">
                  <button type="button" className="fbw__btn" onClick={close}>
                    取消
                  </button>
                  <button
                    type="button"
                    className="fbw__btn fbw__btn--primary"
                    onClick={submit}
                    disabled={status === 'sending' || desc.trim().length < 4}
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 size={15} className="fbw__spin" /> 提交中
                      </>
                    ) : (
                      <>
                        <Send size={15} /> 提交
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
