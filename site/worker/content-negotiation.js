const TOKEN = "[!#$%&'*+.^_`|~0-9a-z-]+"
const MEDIA_RANGE = new RegExp(`^(${TOKEN}|\\*)/(${TOKEN}|\\*)$`, 'i')

function parseQuality(value) {
  if (value === undefined) return 1
  const normalized = value.trim()
  if (!/^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(normalized)) return null
  return Number(normalized)
}

function parseRange(member) {
  const [mediaType, ...parameters] = member.split(';').map((part) => part.trim())
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
    if (name !== 'q') continue
    if (quality !== undefined) return null
    quality = parseQuality(parameter.slice(separator + 1))
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
  const ranges = accept
    .split(',')
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
