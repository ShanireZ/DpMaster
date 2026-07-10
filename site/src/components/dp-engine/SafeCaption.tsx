import { createElement } from 'react'
import type { ReactNode } from 'react'
import { parseSafeCaption } from './safeCaptionModel.ts'
import type { SafeCaptionNode } from './safeCaptionModel.ts'

export interface SafeCaptionProps {
  html: string
  className?: string
}

function renderCaptionNode(node: SafeCaptionNode, key: number): ReactNode {
  if (typeof node === 'string') return node
  if (node.tag === 'br') return createElement('br', { key })

  const props = node.className ? { key, className: node.className } : { key }
  return createElement(
    node.tag,
    props,
    ...node.children.map((child, childIndex) => renderCaptionNode(child, childIndex)),
  )
}

export function SafeCaption({ html, className }: SafeCaptionProps) {
  return <div className={className}>{parseSafeCaption(html).map(renderCaptionNode)}</div>
}
