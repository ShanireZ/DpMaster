import type { ReactNode } from 'react'
import { VIZ_STATE_ROLES, type VizStateRole } from './vizStateTypes.ts'

export function VizStateMark({
  role,
  children,
}: {
  role: VizStateRole
  children?: ReactNode
}) {
  const definition = VIZ_STATE_ROLES.find((candidate) => candidate.role === role)
  return (
    <span
      className="viz-state-mark"
      data-viz-role={role}
      aria-label={`${definition?.label ?? role}状态`}
    >
      <span className="viz-state-mark__symbol" aria-hidden="true">
        {definition?.symbol}
      </span>
      {children && <span className="viz-state-mark__label">{children}</span>}
    </span>
  )
}

export function VizStateKey({ className = '' }: { className?: string }) {
  return (
    <ul
      className={`viz-state-key${className ? ` ${className}` : ''}`}
      aria-label="可视状态图例"
    >
      {VIZ_STATE_ROLES.map((definition) => (
        <li key={definition.role}>
          <VizStateMark role={definition.role}>{definition.label}</VizStateMark>
          <span className="viz-state-key__description">{definition.description}</span>
        </li>
      ))}
    </ul>
  )
}
