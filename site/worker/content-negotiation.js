const TOKEN = "[!#$%&'*+.^_`|~0-9a-z-]+"
const MEDIA_RANGE = new RegExp(`^(${TOKEN}|\\*)/(${TOKEN}|\\*)$`, 'i')
const TOKEN_VALUE = new RegExp(`^${TOKEN}$`, 'i')

function splitDelimited(value, delimiter) {
  const parts = []
  let start = 0
  let quoted = false
  let escaped = false
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (quoted && character === '\\') {
      escaped = true
      continue
    }
    if (character === '"') {
      quoted = !quoted
      continue
    }
    if (!quoted && character === delimiter) {
      parts.push(value.slice(start, index))
      start = index + 1
    }
  }
  if (quoted || escaped) return null
  parts.push(value.slice(start))
  return parts
}

function validParameterValue(value) {
  if (TOKEN_VALUE.test(value)) return true
  if (value.length < 2 || value[0] !== '"' || value.at(-1) !== '"') return false
  for (let index = 1; index < value.length - 1; index += 1) {
    const code = value.charCodeAt(index)
    if (value[index] === '\\') {
      index += 1
      if (index >= value.length - 1) return false
      const escapedCode = value.charCodeAt(index)
      if (escapedCode !== 9 && (escapedCode < 32 || escapedCode === 127)) return false
      continue
    }
    if (value[index] === '"' || (code !== 9 && (code < 32 || code === 127))) return false
  }
  return true
}

function parseQuality(value) {
  if (value === undefined) return 1
  const normalized = value.trim()
  if (!/^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(normalized)) return null
  return Number(normalized)
}

function parseRange(member) {
  const split = splitDelimited(member, ';')
  if (!split) return null
  const [mediaType, ...parameters] = split.map((part) => part.trim())
  const match = MEDIA_RANGE.exec(mediaType)
  if (!match) return null
  const type = match[1].toLowerCase()
  const subtype = match[2].toLowerCase()
  if (type === '*' && subtype !== '*') return null

  let quality
  for (const parameter of parameters) {
    if (!parameter) return null
    const separator = parameter.indexOf('=')
    if (separator < 1) return null
    const name = parameter.slice(0, separator).trim().toLowerCase()
    const value = parameter.slice(separator + 1).trim()
    if (!TOKEN_VALUE.test(name) || !validParameterValue(value)) return null
    if (name !== 'q') continue
    if (quality !== undefined) return null
    quality = parseQuality(value)
    if (quality === null) return null
  }

  return {
    type,
    subtype,
    quality: quality ?? 1,
    specificity: type === '*' ? 0 : subtype === '*' ? 1 : 2,
  }
}

function effectiveMatch(ranges, subtype) {
  const matches = ranges.filter((range) => (
    (range.type === '*' || range.type === 'text')
    && (range.subtype === '*' || range.subtype === subtype)
  ))
  if (matches.length === 0) return null

  const specificity = Math.max(...matches.map((range) => range.specificity))
  const mostSpecific = matches.filter((range) => range.specificity === specificity)
  return {
    quality: Math.max(...mostSpecific.map((range) => range.quality)),
    specificity,
  }
}

export function negotiateRepresentation(accept) {
  if (accept === null || accept === undefined) return 'html'
  const members = splitDelimited(accept, ',')
  const ranges = (members ?? [])
    .map(parseRange)
    .filter((range) => range !== null)

  const candidates = [
    { representation: 'html', ...effectiveMatch(ranges, 'html') },
    { representation: 'markdown', ...effectiveMatch(ranges, 'markdown') },
  ].filter((candidate) => candidate.quality > 0)

  if (candidates.length === 0) return null
  candidates.sort((left, right) => (
    right.quality - left.quality
    || right.specificity - left.specificity
    || (left.representation === 'html' ? -1 : 1)
  ))
  return candidates[0].representation
}
