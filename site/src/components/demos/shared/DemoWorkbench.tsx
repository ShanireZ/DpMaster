import { useId, type ReactNode } from 'react'
import type { PartId } from '../../../data/catalog.ts'
import type { VizStateRole } from './vizStateTypes.ts'
import './demo-standard.css'

export interface DemoWorkbenchProps {
  family: PartId
  title: string
  eyebrow?: string
  description?: string
  visual: ReactNode
  rail: ReactNode
  status?: ReactNode
  details?: ReactNode
  activeRole?: VizStateRole
  complete?: boolean
  className?: string
}

export function DemoWorkbench({
  family,
  title,
  eyebrow = 'Algorithm instrument',
  description,
  visual,
  rail,
  status,
  details,
  activeRole = 'current',
  complete = false,
  className = '',
}: DemoWorkbenchProps) {
  const headingId = useId()
  return (
    <section
      className={`demo-workbench${className ? ` ${className}` : ''}`}
      data-family={family}
      data-active-role={activeRole}
      data-complete={complete ? 'true' : 'false'}
      aria-labelledby={headingId}
    >
      <header className="demo-workbench__header">
        <span className="demo-workbench__index" aria-hidden="true">{family.toUpperCase()}</span>
        <div className="demo-workbench__heading">
          <span className="demo-workbench__eyebrow">{eyebrow}</span>
          <h2 id={headingId}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {status && (
          <div className="demo-workbench__status" aria-live="polite">
            {status}
          </div>
        )}
      </header>
      <div className="demo-workbench__stage">
        <div className="demo-workbench__visual">{visual}</div>
        <span className="demo-workbench__completion" aria-hidden="true" />
      </div>
      <div className="demo-workbench__rail">{rail}</div>
      {details && <div className="demo-workbench__details">{details}</div>}
    </section>
  )
}
