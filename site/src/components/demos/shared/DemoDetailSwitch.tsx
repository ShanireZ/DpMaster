import { useId, useState, type ReactNode } from 'react'

export interface DemoDetailItem {
  id: string
  label: string
  content: ReactNode
}

export function DemoDetailSwitch({
  label = '演示细节层',
  items,
  initialItem,
}: {
  label?: string
  items: ReadonlyArray<DemoDetailItem>
  initialItem?: string
}) {
  const fallback = items[0]?.id ?? ''
  const [active, setActive] = useState(
    items.some((item) => item.id === initialItem) ? initialItem! : fallback,
  )
  const id = useId()

  return (
    <div className="demo-detail-switch">
      <div className="demo-detail-switch__tabs" role="tablist" aria-label={label}>
        {items.map((item) => {
          const selected = active === item.id
          return (
            <button
              key={item.id}
              id={`${id}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${id}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${id}-panel-${item.id}`}
          className="demo-detail-switch__panel"
          role="tabpanel"
          aria-labelledby={`${id}-tab-${item.id}`}
          hidden={active !== item.id}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
