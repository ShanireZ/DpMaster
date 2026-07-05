import { Link } from 'react-router-dom'
import { Construction, ArrowLeft } from 'lucide-react'

export default function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ maxWidth: 640, padding: 'var(--sp-7) 0' }}>
      <div
        style={{
          display: 'inline-grid',
          placeItems: 'center',
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          color: 'var(--accent-2)',
          marginBottom: 'var(--sp-4)',
        }}
      >
        <Construction size={28} />
      </div>
      <h1 style={{ fontSize: 30, marginBottom: 'var(--sp-3)' }}>{title}</h1>
      <p style={{ color: 'var(--text-2)', marginBottom: 'var(--sp-5)' }}>
        本页正在建设中。当前处于垂直切片阶段——已上线 B 背包的 01 背包与完全背包，其余内容将在全量建设阶段陆续补齐。
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--text-1)',
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={18} /> 返回首页
      </Link>
    </div>
  )
}
