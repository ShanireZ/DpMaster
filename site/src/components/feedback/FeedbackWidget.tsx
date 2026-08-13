import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageSquarePlus, X, Send, Check, Loader2 } from 'lucide-react'
import { getPart } from '../../data/catalog'
import { getRuntimeSiteConfig } from '../../config/site.ts'
import { trackAnalyticsEvent } from '../../analytics/index.ts'
import './feedback.css'

type Kind = '内容错漏' | '显示异常' | '其他建议'
const KINDS: Kind[] = ['内容错漏', '显示异常', '其他建议']

type Status = 'idle' | 'sending' | 'ok' | 'error'

type BrandVersion = {
  brand: string
  version: string
}

type UserAgentData = {
  brands?: BrandVersion[]
  mobile?: boolean
  platform?: string
  getHighEntropyValues?: (hints: string[]) => Promise<Record<string, unknown>>
}

type Diagnostics = {
  url: string
  ua: string
  browser: string
  device: string
  viewport: string
  screen: string
  locale: string
  timezone: string
}

function brandVersions(value: unknown): BrandVersion[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const brand = String(Reflect.get(item, 'brand') ?? '').trim()
    const version = String(Reflect.get(item, 'version') ?? '').trim()
    return brand ? [{ brand, version }] : []
  })
}

function browserLabel(ua: string, brands: BrandVersion[]): string {
  const usefulBrands = brands.filter(({ brand }) => !/not.?a.?brand|chromium/i.test(brand))
  // UA-CH 往往会同时返回浏览器品牌与 Chromium/Chrome 品牌；按派生浏览器
  // 优先级挑选，避免把 Edge、Opera 等误报成 Chrome。
  for (const pattern of [/edge/i, /opera/i, /vivaldi/i, /brave/i, /firefox/i, /chrome/i]) {
    const preferredBrand = usefulBrands.find(({ brand }) => pattern.test(brand))
    if (preferredBrand) {
      return `${preferredBrand.brand}${preferredBrand.version ? ` ${preferredBrand.version}` : ''}`
    }
  }

  const signatures: Array<[RegExp, string]> = [
    [/\bEdgA?\/([\d.]+)/, 'Microsoft Edge'],
    [/\bEdgiOS\/([\d.]+)/, 'Microsoft Edge'],
    [/\bOPR\/([\d.]+)/, 'Opera'],
    [/\bVivaldi\/([\d.]+)/, 'Vivaldi'],
    [/\bYaBrowser\/([\d.]+)/, 'Yandex Browser'],
    [/\bSamsungBrowser\/([\d.]+)/, 'Samsung Internet'],
    [/\bFxiOS\/([\d.]+)/, 'Firefox'],
    [/\bFirefox\/([\d.]+)/, 'Firefox'],
    [/\bCriOS\/([\d.]+)/, 'Google Chrome'],
    [/\bChrome\/([\d.]+)/, 'Google Chrome'],
    [/\bVersion\/([\d.]+).*Safari\//, 'Safari'],
  ]
  for (const [pattern, name] of signatures) {
    const match = ua.match(pattern)
    if (match) return `${name} ${match[1]}`
  }
  return usefulBrands.length
    ? usefulBrands.map(({ brand, version }) => `${brand} ${version}`.trim()).join(', ')
    : '未识别浏览器'
}

async function collectDiagnostics(): Promise<Diagnostics> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      url: '',
      ua: '',
      browser: '未识别浏览器',
      device: '未识别设备',
      viewport: '',
      screen: '',
      locale: '',
      timezone: '',
    }
  }

  const ua = navigator.userAgent
  const uaData = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData
  let highEntropy: Record<string, unknown> = {}
  if (uaData?.getHighEntropyValues) {
    try {
      highEntropy = await uaData.getHighEntropyValues([
        'architecture',
        'bitness',
        'fullVersionList',
        'model',
        'platformVersion',
        'wow64',
      ])
    } catch {
      // 部分浏览器会拒绝高熵 UA-CH；下面仍会提交标准 UA 与平台信息。
    }
  }

  const brands = brandVersions(highEntropy.fullVersionList)
  const fallbackBrands = brandVersions(uaData?.brands)
  const platform = String(uaData?.platform || navigator.platform || '').trim()
  const platformVersion = String(highEntropy.platformVersion || '').trim()
  const architecture = String(highEntropy.architecture || '').trim()
  const bitness = String(highEntropy.bitness || '').trim()
  const model = String(highEntropy.model || '').trim()
  const device = [
    platform && `${platform}${platformVersion ? ` ${platformVersion}` : ''}`,
    architecture && `${architecture}${bitness ? ` ${bitness} 位` : ''}`,
    model,
    uaData?.mobile === true ? '移动设备' : uaData?.mobile === false ? '桌面设备' : '',
    navigator.maxTouchPoints > 0 ? `${navigator.maxTouchPoints} 点触控` : '',
  ].filter(Boolean).join(' / ') || '未识别设备'

  return {
    url: window.location.href,
    ua,
    browser: browserLabel(ua, brands.length ? brands : fallbackBrands),
    device,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    screen: `${window.screen.width}×${window.screen.height} @ ${window.devicePixelRatio || 1}x`,
    locale: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  }
}

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
  const [kind, setKind] = useState<Kind>('内容错漏')
  const [desc, setDesc] = useState('')
  const [contact, setContact] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [receiptId, setReceiptId] = useState('')
  const [copied, setCopied] = useState(false)
  const [page, setPage] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef<HTMLButtonElement>(null)

  // 打开时快照当前页、锁定背景滚动，并把键盘焦点限定在对话框内。
  useEffect(() => {
    if (!open) return
    setPage(pageLabel(location.pathname))
    const t = setTimeout(() => descRef.current?.focus(), 40)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab') {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((element) => element.offsetParent !== null)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const reset = () => {
    setKind('内容错漏')
    setDesc('')
    setContact('')
    setStatus('idle')
    setErrorMessage('')
    setReceiptId('')
    setCopied(false)
  }
  const close = () => {
    setOpen(false)
    setTimeout(() => triggerRef.current?.focus(), 0)
    // 提交成功后关闭时清空，避免下次残留
    if (status === 'ok') setTimeout(reset, 200)
  }

  useEffect(() => {
    if (status === 'ok') doneRef.current?.focus()
  }, [status])

  const payload = async () => ({
    kind,
    page: page || pageLabel(location.pathname),
    path: location.pathname,
    description: desc.trim(),
    contact: contact.trim(),
    ...(await collectDiagnostics()),
    ts: new Date().toISOString(),
  })

  const asText = async () => {
    const p = await payload()
    return [
      '【DP大师 · 问题反馈】',
      `类型：${p.kind}`,
      `页面：${p.page}（${p.path}）`,
      `描述：${p.description}`,
      p.contact && `联系方式：${p.contact}`,
      p.url && `网址：${p.url}`,
      p.browser && `浏览器：${p.browser}`,
      p.device && `设备：${p.device}`,
      p.viewport && `视口：${p.viewport}；屏幕：${p.screen}`,
      p.locale && `区域：${p.locale}；时区：${p.timezone}`,
      p.ua && `UA：${p.ua}`,
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
    setErrorMessage('')
    trackAnalyticsEvent({
      event: 'feedback_submitted',
      path: location.pathname,
      metadata: { kind },
    })
    try {
      const res = await fetch(getRuntimeSiteConfig().feedbackEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(await payload()),
      })
      let result: {
        ok?: boolean
        status?: string
        message?: string
        requestId?: string
      } | null = null
      try {
        result = await res.json()
      } catch {
        result = null
      }
      if (!res.ok || !result?.ok || result.status !== 'delivered') {
        setErrorMessage(
          res.status === 429
            ? '提交太频繁，请稍后再试。'
            : result?.message || '提交没成功，请检查网络后再试。',
        )
        setStatus('error')
        trackAnalyticsEvent({
          event: 'feedback_failed',
          path: location.pathname,
          metadata: { status: res.status },
        })
        return
      }
      setReceiptId(result.requestId || '')
      setStatus('ok')
      trackAnalyticsEvent({
        event: 'feedback_succeeded',
        path: location.pathname,
        metadata: { kind },
      })
    } catch {
      // 后端未接通/网络失败：降级为「复制反馈」，让用户仍能把内容交出去
      setErrorMessage('提交没成功，请检查网络后再试。')
      setStatus('error')
      trackAnalyticsEvent({
        event: 'feedback_failed',
        path: location.pathname,
        metadata: { status: 'network' },
      })
    }
  }

  const copyFallback = async () => {
    try {
      await navigator.clipboard.writeText(await asText())
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* 剪贴板不可用则忽略 */
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="fbw__fab"
        onClick={() => {
          setOpen(true)
          trackAnalyticsEvent({ event: 'feedback_opened', path: location.pathname })
        }}
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
                问题反馈
              </h2>
              <button className="fbw__close" onClick={close} aria-label="关闭">
                <X size={18} />
              </button>
            </div>

            {status === 'ok' ? (
              <div className="fbw__done" aria-live="polite">
                <span className="fbw__done-icon">
                  <Check size={26} />
                </span>
                <p className="fbw__done-title">已收到，谢谢你！</p>
                <p className="fbw__done-sub">反馈已送达维护通道，我们会据此复核和改进。</p>
                {receiptId && (
                  <p className="fbw__receipt">
                    回执编号 <code>{receiptId}</code>
                  </p>
                )}
                <button ref={doneRef} className="fbw__btn fbw__btn--primary" onClick={close}>
                  完成
                </button>
              </div>
            ) : (
              <div className="fbw__body">
                <fieldset className="fbw__field">
                  <legend className="fbw__sr-only">反馈类型</legend>
                  <div className="fbw__kinds">
                    {KINDS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        className={`fbw__kind${kind === k ? ' on' : ''}`}
                        aria-pressed={kind === k}
                        onClick={() => setKind(k)}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </fieldset>

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
                  <div className="fbw__error" role="alert">
                    {errorMessage}你也可以
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
