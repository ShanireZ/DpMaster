import type { ReactNode } from 'react'
import { TriangleAlert, Lightbulb } from 'lucide-react'

export default function InfoBox({
  kind = 'key',
  title,
  children,
}: {
  kind?: 'warn' | 'key'
  title: string
  children: ReactNode
}) {
  return (
    <div className={`infobox infobox--${kind}`}>
      <span className="infobox__icon">
        {kind === 'warn' ? <TriangleAlert size={18} /> : <Lightbulb size={18} />}
      </span>
      <div>
        <h4>{title}</h4>
        <p>{children}</p>
      </div>
    </div>
  )
}
