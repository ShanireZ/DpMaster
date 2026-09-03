import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, extname } from 'node:path'
import test from 'node:test'

// Design tokens are the one place where a mistake leaves no trace: an undefined
// custom property makes the browser fall back silently, so the page still renders
// and every other gate stays green. `site/src/styles/tokens.css` is the token
// authority (docs/design/visual-system.md is the navigation layer, not the source).

const src = fileURLToPath(new URL('../src/', import.meta.url))
const tokensPath = join(src, 'styles', 'tokens.css')

const DECLARATION = /(?:^|[;{])\s*(--[A-Za-z0-9_-]+)\s*:\s*([^;}]*)/gm
const AT_PROPERTY = /@property\s+(--[A-Za-z0-9_-]+)/g
const REFERENCE = /var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,|\))/g

// Custom properties that are legitimately set outside CSS. Every entry names who
// sets it — an entry without a verified setter is a bug in disguise, not a waiver.
const SET_OUTSIDE_CSS = new Map([
  ['--atlas-width', 'components/art/PolyLessonPlate.tsx inline style'],
  ['--atlas-left', 'components/art/PolyLessonPlate.tsx inline style'],
  ['--atlas-top', 'components/art/PolyLessonPlate.tsx inline style'],
  ['--atlas-clip-top', 'components/art/PolyLessonPlate.tsx inline style'],
  ['--atlas-clip-right', 'components/art/PolyLessonPlate.tsx inline style'],
  ['--atlas-clip-bottom', 'components/art/PolyLessonPlate.tsx inline style'],
  ['--atlas-clip-left', 'components/art/PolyLessonPlate.tsx inline style'],
  ['--linear-plate-arrow', 'components/art/LinearFamilyArt.tsx inline style'],
  ['--nav-family', 'components/layout/Sidebar.tsx inline style'],
  ['--pg', 'pages/MethodPage.tsx inline style'],
  ['--title-units', 'pages/TypePage.tsx inline style'],
  ['--shiki-dark', 'shiki dual-theme output, driven by src/lib/highlighter.ts'],
  ['--shiki-light', 'shiki dual-theme output, driven by src/lib/highlighter.ts'],
])

// Dark-only colours that light mode deliberately reuses. Empty on purpose: every
// colour token currently has a light-mode value. Adding an entry here is a
// visual-direction call the owner makes (see AGENTS.md Change rules), and it must
// say why reusing the dark value is right — an unexplained entry is a waived bug.
const LIGHT_MODE_REUSES_DARK = new Set([])

function stylesheets(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) stylesheets(path, found)
    else if (extname(entry.name) === '.css') found.push(path)
  }
  return found
}

function scan(files) {
  const defined = new Set()
  const referenced = new Map()
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(DECLARATION)) defined.add(match[1])
    for (const match of text.matchAll(AT_PROPERTY)) defined.add(match[1])
    for (const match of text.matchAll(REFERENCE)) {
      if (!referenced.has(match[1])) referenced.set(match[1], new Set())
      referenced.get(match[1]).add(file.slice(src.length).replace(/\\/g, '/'))
    }
  }
  return { defined, referenced }
}

function declarationsIn(css, selector) {
  const opening = css.match(selector)
  if (!opening) return null
  const from = opening.index + opening[0].length
  const to = css.indexOf('\n}', from)
  if (to === -1) return null
  const declarations = new Map()
  for (const match of css.slice(from, to).matchAll(DECLARATION)) {
    declarations.set(match[1], match[2].trim())
  }
  return declarations
}

const isColour = (value) =>
  /^(#|rgb\(|rgba\(|hsl\(|hsla\(|oklch\(|oklab\(|lab\(|lch\(|color-mix\()/i.test(value)

// A scan that silently matches nothing reports "zero violations" — identical output
// to a clean tree. Pin the sample down before trusting any count derived from it.
test('the scan reaches the real stylesheets and parses them', () => {
  const files = stylesheets(src)
  assert.ok(files.length >= 40, `expected the component tree to yield 40+ stylesheets, saw ${files.length}`)
  assert.ok(files.includes(tokensPath), 'tokens.css must be part of the scanned set')

  const { defined, referenced } = scan(files)
  assert.ok(defined.size >= 80, `expected 80+ defined custom properties, saw ${defined.size}`)
  assert.ok(referenced.size >= 80, `expected 80+ referenced custom properties, saw ${referenced.size}`)
  for (const canary of ['--canvas', '--text-1', '--accent-1', '--font-display']) {
    assert.ok(defined.has(canary), `canary ${canary} is declared in tokens.css but the scan missed it`)
  }
})

test('every var(--x) resolves to a definition', () => {
  const { defined, referenced } = scan(stylesheets(src))
  const unresolved = [...referenced.keys()]
    .filter((name) => !defined.has(name) && !SET_OUTSIDE_CSS.has(name))
    .sort()
  assert.deepEqual(
    unresolved,
    [],
    `undefined custom properties fall back silently — nothing else will report them:\n` +
      unresolved.map((name) => `  ${name}  <- ${[...referenced.get(name)].join(', ')}`).join('\n'),
  )
})

test('counter-proof: an undefined reference is actually caught', () => {
  const defined = new Set(['--real'])
  const referenced = new Map([
    ['--real', new Set(['a.css'])],
    ['--ghost', new Set(['b.css'])],
  ])
  const unresolved = [...referenced.keys()].filter((name) => !defined.has(name))
  assert.deepEqual(unresolved, ['--ghost'], 'the check must flag a reference with no declaration')
})

test('every waiver names a setter outside CSS', () => {
  for (const [name, setter] of SET_OUTSIDE_CSS) {
    assert.ok(setter.trim().length > 0, `${name} is waived without naming who sets it`)
  }
})

test('colour tokens declared for dark mode are declared for light mode too', () => {
  const css = readFileSync(tokensPath, 'utf8')
  const dark = declarationsIn(css, /:root\s*\{/)
  const light = declarationsIn(css, /\[data-theme=['"]light['"]\]\s*\{/)
  assert.ok(dark, ':root block not found — the check cannot pass by failing to parse')
  assert.ok(light, 'light-theme block not found — the check cannot pass by failing to parse')
  assert.ok(dark.size >= 60, `expected 60+ tokens in :root, parsed ${dark.size}`)

  // Only colours: spacing, radii, fonts and easings are theme-independent by design,
  // and demanding light-mode copies of them would make this gate cry wolf every day.
  const missing = [...dark]
    .filter(([name, value]) => isColour(value) && !light.has(name) && !LIGHT_MODE_REUSES_DARK.has(name))
    .map(([name]) => name)
    .sort()
  assert.deepEqual(missing, [], `colour tokens with no light-mode value: ${missing.join(', ')}`)
})

// ---------------------------------------------------------------------------
// Contrast. Nothing else in this repo checks colour contrast: the playwright
// specs assert that geometry and content survive a theme switch, and
// accessibility-contract.test.mjs covers skip-links, focus and aria — neither
// looks at colour. That gap is how four viz tokens sat at 1.75:1 in light mode.
// Contrast belongs in the token gate, not behind `pnpm build`: change a colour
// and you should hear about it at once.
//
// Text lands on these surfaces. --viz-cell-2 is deliberately absent: the only
// rule that uses it as a background (.dp-cell.is-settled, dp-viz.css) sets its
// own text to --text-1, and viz colours there are border/box-shadow only.
const TEXT_SURFACES = ['--canvas', '--surface-1', '--surface-2', '--surface-3', '--viz-cell']
const AA_NORMAL = 4.5

// Every token used directly as `color:` needs an entry here — adding one without
// registering it turns this gate red, which is the point: the registry cannot
// silently fall behind the stylesheets.
//   on    — judge against these surfaces instead of all of TEXT_SURFACES
//   setBy — value never appears in tokens.css; name who assigns it
//   debt  — currently below AA. The number is the measured floor: contrast may
//           only improve, and improving it means tightening the number here.
//           Never add an entry to dodge a failure; DEBT_COUNT pins how many exist.
const TEXT_ROLES = {
  '--text-1': {},
  '--text-2': {},
  '--accent-1': {},
  '--accent-2': {},
  '--e-1': {},
  '--g-1': {},
  '--viz-current': {},
  '--viz-source': {},
  '--viz-chosen': {},
  '--viz-invalid': {},
  '--text-on-accent': { on: ['--accent-1', '--accent-2'] },
  '--text-3': {},
  '--family-color': { setBy: 'pages/*.tsx inline style, per DP family' },
  '--material-color': { setBy: 'components/art inline style' },
  '--specimen-family': { setBy: 'specimen pages inline style' },
  '--state-color': { setBy: "demo-standard.css [data-viz-role] blocks" },
  '--workbench-family': { setBy: 'demo workbench inline style' },
  '--shiki-dark': { setBy: 'shiki dual-theme output' },
  '--shiki-light': { setBy: 'shiki dual-theme output' },
}
// Zero, and it should stay that way. --viz-settled used to sit here at 2.16:1;
// it was fixed by usage, not by colour — it no longer sets `color:` at all, and
// keeps carrying the "settled" state through its hatching and strokes instead.
const DEBT_COUNT = 0

const COLOUR_AS_TEXT = /(?:^|[;{]|\s)color\s*:\s*var\(\s*(--[A-Za-z0-9_-]+)\s*\)/gm

function channelLuminance(channel) {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function toRgb(value) {
  if (!value) return null
  const hex = /^#([0-9a-f]{6})$/i.exec(value.trim())
  if (hex) return [0, 2, 4].map((i) => Number.parseInt(hex[1].slice(i, i + 2), 16))
  const fn = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(value.trim())
  return fn ? [Number(fn[1]), Number(fn[2]), Number(fn[3])] : null
}

function contrastRatio(a, b) {
  const lum = (rgb) =>
    0.2126 * channelLuminance(rgb[0]) + 0.7152 * channelLuminance(rgb[1]) + 0.0722 * channelLuminance(rgb[2])
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// A light-mode token that is not redeclared inherits the :root value.
function resolveColour(theme, base, name, depth = 0) {
  const raw = theme.get(name) ?? base.get(name)
  if (raw === undefined || depth > 8) return null
  const ref = /^var\(\s*(--[A-Za-z0-9_-]+)/.exec(raw.trim())
  return ref ? resolveColour(theme, base, ref[1], depth + 1) : toRgb(raw)
}

function themes() {
  const css = readFileSync(tokensPath, 'utf8')
  const dark = declarationsIn(css, /:root\s*\{/)
  const light = declarationsIn(css, /\[data-theme=['"]light['"]\]\s*\{/)
  return [
    { name: 'dark', theme: dark, base: dark },
    { name: 'light', theme: light, base: dark },
  ]
}

test('the contrast maths is right', () => {
  assert.equal(Math.round(contrastRatio([0, 0, 0], [255, 255, 255])), 21)
  assert.equal(Math.round(contrastRatio([75, 85, 99], [75, 85, 99])), 1)
})

test('every token used as `color:` is registered', () => {
  const used = new Set()
  for (const file of stylesheets(src)) {
    for (const m of readFileSync(file, 'utf8').matchAll(COLOUR_AS_TEXT)) used.add(m[1])
  }
  assert.ok(used.size >= 15, `expected 15+ tokens used as text colour, saw ${used.size}`)
  const unregistered = [...used].filter((name) => !(name in TEXT_ROLES)).sort()
  assert.deepEqual(
    unregistered,
    [],
    `new text colours with no contrast ruling: ${unregistered.join(', ')}`,
  )
})

test('registered text colours clear AA on every surface they land on, in both themes', () => {
  const failures = []
  for (const { name: themeName, theme, base } of themes()) {
    for (const [name, rule] of Object.entries(TEXT_ROLES)) {
      if (rule.setBy) continue
      const fg = resolveColour(theme, base, name)
      assert.ok(fg, `${name} has no resolvable colour in ${themeName} — the check cannot pass by failing to parse`)
      for (const surface of rule.on ?? TEXT_SURFACES) {
        const bg = resolveColour(theme, base, surface)
        assert.ok(bg, `surface ${surface} has no resolvable colour in ${themeName}`)
        // Compare at the precision the floors are written in: a measured 3.0299…
        // is the same reading as a registered 3.03, and must not read as a regression.
        const ratio = Number(contrastRatio(fg, bg).toFixed(2))
        const floor = rule.debt ?? AA_NORMAL
        if (ratio < floor) failures.push(`${themeName}: ${name} on ${surface} = ${ratio.toFixed(2)}, needs ${floor}`)
      }
    }
  }
  assert.deepEqual(failures, [], failures.join('\n'))
})

test('the known-contrast-debt list has not grown', () => {
  const debts = Object.entries(TEXT_ROLES).filter(([, r]) => r.debt !== undefined)
  assert.equal(debts.length, DEBT_COUNT, 'a token was waived below AA — raise the colour, do not extend the list')
  for (const [name, rule] of debts) {
    assert.ok(rule.why, `${name} is waived below AA without saying what renders in it`)
    assert.ok(rule.debt < AA_NORMAL, `${name} is listed as debt but already clears AA — tighten it to a plain entry`)
  }
})

test('counter-proof: a text colour below its floor is actually caught', () => {
  const black = [0, 0, 0]
  const nearBlack = [17, 17, 17]
  assert.ok(contrastRatio(black, nearBlack) < AA_NORMAL, 'two near-identical colours must read as failing')
  assert.ok(contrastRatio(black, [255, 255, 255]) >= AA_NORMAL, 'black on white must read as passing')
})

test('counter-proof: a colour missing from light mode is actually caught', () => {
  const synthetic = [
    ':root {',
    '  --demo-ink: #111111;',
    '  --demo-gap: 8px;',
    '}',
    "[data-theme='light'] {",
    '  --demo-gap: 8px;',
    '}',
  ].join('\n')
  const dark = declarationsIn(synthetic, /:root\s*\{/)
  const light = declarationsIn(synthetic, /\[data-theme=['"]light['"]\]\s*\{/)
  const missing = [...dark].filter(([name, value]) => isColour(value) && !light.has(name)).map(([name]) => name)
  assert.deepEqual(missing, ['--demo-ink'], 'a dark-only colour must be reported')
  assert.ok(!missing.includes('--demo-gap'), 'a non-colour token must not be reported')
})
