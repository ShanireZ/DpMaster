export const APPROVED_CAPTION_SPAN_CLASSES = ['mono', 'ok', 'bad', 'cur', 'you'] as const

export type ApprovedCaptionSpanClass = (typeof APPROVED_CAPTION_SPAN_CLASSES)[number]
export type SafeCaptionTag = 'b' | 'strong' | 'code' | 'br' | 'span'

export interface SafeCaptionElement {
  tag: SafeCaptionTag
  className?: ApprovedCaptionSpanClass
  children: SafeCaptionNode[]
}

export type SafeCaptionNode = string | SafeCaptionElement

const APPROVED_SPAN_CLASSES = new Set<string>(APPROVED_CAPTION_SPAN_CLASSES)
const TOKEN = /<[^>]*>|[^<]+|</g
const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
}

function decodeEntities(text: string): string {
  return text.replace(/&(?:#(\d+)|#x([\dA-Fa-f]+)|([A-Za-z]+));/g, (entity, decimal, hex, named) => {
    if (named) return NAMED_ENTITIES[named] ?? entity
    const codePoint = Number.parseInt(decimal ?? hex, decimal ? 10 : 16)
    try {
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity
    } catch {
      return entity
    }
  })
}

function appendText(nodes: SafeCaptionNode[], text: string): void {
  const decoded = decodeEntities(text)
  const previous = nodes.at(-1)
  if (typeof previous === 'string') nodes[nodes.length - 1] = previous + decoded
  else nodes.push(decoded)
}

interface OpenElement {
  node: SafeCaptionElement
  parent: SafeCaptionNode[]
}

function openingElement(token: string): SafeCaptionElement | null {
  const paired = token.match(/^<(b|strong|code)\s*>$/)
  if (paired) return { tag: paired[1] as 'b' | 'strong' | 'code', children: [] }

  const span = token.match(/^<span\s+class\s*=\s*(["'])([^"']+)\1\s*>$/)
  if (!span || !APPROVED_SPAN_CLASSES.has(span[2])) return null
  return {
    tag: 'span',
    className: span[2] as ApprovedCaptionSpanClass,
    children: [],
  }
}

/** Parse the deliberately tiny teaching-caption vocabulary into inert render nodes. */
export function parseSafeCaption(html: string): SafeCaptionNode[] {
  if (!html) return []

  const root: SafeCaptionNode[] = []
  const stack: OpenElement[] = []
  let current = root
  let malformed = false

  for (const token of html.match(TOKEN) ?? []) {
    if (/^<br\s*\/?>$/.test(token)) {
      current.push({ tag: 'br', children: [] })
      continue
    }

    const opening = openingElement(token)
    if (opening) {
      current.push(opening)
      stack.push({ node: opening, parent: current })
      current = opening.children
      continue
    }

    const closing = token.match(/^<\/(b|strong|code|span)\s*>$/)
    if (closing) {
      const open = stack.at(-1)
      if (!open || open.node.tag !== closing[1]) {
        malformed = true
        break
      }
      stack.pop()
      current = open.parent
      continue
    }

    appendText(current, token)
  }

  if (malformed || stack.length > 0) return [decodeEntities(html)]
  return root
}
