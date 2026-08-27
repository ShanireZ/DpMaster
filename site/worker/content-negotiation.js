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

function splitAcceptMembers(value) {
  const parts = []
  let start = 0
  let quoted = false
  let escaped = false
  const recoveryCommas = []
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
    if (character !== ',') continue
    if (!quoted) {
      parts.push(value.slice(start, index))
      start = index + 1
      recoveryCommas.length = 0
    } else if (/^\s*(?:[!#$%&'*+.^_`|~0-9a-z-]+|\*)\//iu.test(value.slice(index + 1))) {
      recoveryCommas.push(index)
    }
  }
  if ((quoted || escaped) && recoveryCommas.length > 0) {
    const recovery = recoveryCommas[0]
    parts.push(value.slice(start, recovery))
    return [...parts, ...splitAcceptMembers(value.slice(recovery + 1))]
  }
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

function parameterValue(value) {
  if (TOKEN_VALUE.test(value)) return value.toLowerCase()
  let decoded = ''
  for (let index = 1; index < value.length - 1; index += 1) {
    if (value[index] === '\\') index += 1
    decoded += value[index]
  }
  return decoded.toLowerCase()
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
  let qualitySeen = false
  const mediaParameters = new Map()
  for (const parameter of parameters) {
    if (!parameter) return null
    const separator = parameter.indexOf('=')
    if (separator < 1) return null
    const name = parameter.slice(0, separator).trim().toLowerCase()
    const value = parameter.slice(separator + 1).trim()
    if (!TOKEN_VALUE.test(name) || !validParameterValue(value)) return null
    if (name === 'q') {
      if (qualitySeen) return null
      qualitySeen = true
      quality = parseQuality(value)
      if (quality === null) return null
      continue
    }
    if (qualitySeen) continue
    if (mediaParameters.has(name)) return null
    mediaParameters.set(name, parameterValue(value))
  }

  return {
    type,
    subtype,
    quality: quality ?? 1,
    specificity: type === '*' ? 0 : subtype === '*' ? 1 : 2,
    mediaParameters,
  }
}

function effectiveMatch(ranges, subtype, representationParameters) {
  const matches = ranges.filter((range) => (
    (range.type === '*' || range.type === 'text')
    && (range.subtype === '*' || range.subtype === subtype)
    && [...range.mediaParameters].every(([name, value]) => (
      representationParameters.get(name) === value
    ))
  ))
  if (matches.length === 0) return null

  const specificity = Math.max(...matches.map((range) => range.specificity))
  const mostSpecific = matches.filter((range) => range.specificity === specificity)
  const parameterCount = Math.max(...mostSpecific.map((range) => range.mediaParameters.size))
  const mostParameterized = mostSpecific.filter((range) => (
    range.mediaParameters.size === parameterCount
  ))
  return {
    quality: Math.max(...mostParameterized.map((range) => range.quality)),
    specificity,
    parameterCount,
  }
}

export function negotiateRepresentation(accept) {
  if (accept === null || accept === undefined) return 'html'
  const members = splitAcceptMembers(accept)
  const ranges = (members ?? [])
    .map(parseRange)
    .filter((range) => range !== null)

  const candidates = [
    {
      representation: 'html',
      ...effectiveMatch(ranges, 'html', new Map([['charset', 'utf-8']])),
    },
    {
      representation: 'markdown',
      ...effectiveMatch(ranges, 'markdown', new Map([['charset', 'utf-8']])),
    },
  ].filter((candidate) => candidate.quality > 0)

  if (candidates.length === 0) return null
  candidates.sort((left, right) => (
    right.quality - left.quality
    || right.specificity - left.specificity
    || right.parameterCount - left.parameterCount
    || (left.representation === 'html' ? -1 : 1)
  ))
  return candidates[0].representation
}
