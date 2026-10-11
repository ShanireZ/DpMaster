import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'

import { keepWoff2FontSources, woff2OnlyFonts } from '../woff2-fonts.ts'

const require = createRequire(import.meta.url)
const LEGACY_FONT_URL = /url\([^)]*\.(?:woff|ttf|otf|eot)(?:[?#][^)]*)?\)/i

function fontFaces(css) {
  return css.match(/@font-face\s*\{[^}]*\}/g) ?? []
}

test('a fontsource @font-face keeps only its woff2 source', () => {
  const css = `@font-face {
  font-family: 'JetBrains Mono';
  font-display: swap;
  src: url(./files/a.woff2) format('woff2'), url(./files/a.woff) format('woff');
}`
  const result = keepWoff2FontSources(css)
  assert.match(result, /src: url\(\.\/files\/a\.woff2\) format\('woff2'\);/)
  assert.doesNotMatch(result, LEGACY_FONT_URL)
  assert.match(result, /font-display: swap;/)
})

test('a minified KaTeX @font-face keeps only its woff2 source', () => {
  const css =
    '.x{color:red}@font-face{font-display:block;font-family:KaTeX_AMS;src:url(fonts/A.woff2) format("woff2"),url(fonts/A.woff) format("woff"),url(fonts/A.ttf) format("truetype")}.y{src:none}'
  const result = keepWoff2FontSources(css)
  assert.equal(
    result,
    '.x{color:red}@font-face{font-display:block;font-family:KaTeX_AMS;src:url(fonts/A.woff2) format("woff2")}.y{src:none}',
  )
})

test('commas inside a woff2 url do not split the source list', () => {
  const css = '@font-face{src:url("data:font/woff2;base64,AA,BB") format("woff2"),url(a.woff) format("woff")}'
  assert.equal(
    keepWoff2FontSources(css),
    '@font-face{src:url("data:font/woff2;base64,AA,BB") format("woff2")}',
  )
})

test('an @font-face without a woff2 source fails closed instead of losing the font', () => {
  const css = "@font-face{font-family:Old;src:url(old.woff) format('woff')}"
  assert.throws(() => keepWoff2FontSources(css, 'legacy.css'), /legacy\.css.*woff2/)
})

test('CSS without @font-face is returned unchanged', () => {
  const css = '.a{background:url(x.png)}'
  assert.equal(keepWoff2FontSources(css), css)
})

test('the installed KaTeX and fontsource stylesheets rewrite to woff2-only faces', () => {
  for (const specifier of [
    'katex/dist/katex.min.css',
    '@fontsource/space-grotesk/latin-400.css',
    '@fontsource/space-grotesk/latin-500.css',
    '@fontsource/space-grotesk/latin-700.css',
    '@fontsource/jetbrains-mono/latin-400.css',
    '@fontsource/jetbrains-mono/latin-500.css',
  ]) {
    const css = readFileSync(require.resolve(specifier), 'utf8')
    const before = fontFaces(css)
    assert.ok(before.length > 0, specifier)
    assert.match(css, LEGACY_FONT_URL, `${specifier} 不再带旧格式，插件可能已无必要`)

    const after = fontFaces(keepWoff2FontSources(css, specifier))
    assert.equal(after.length, before.length, specifier)
    for (const face of after) {
      assert.doesNotMatch(face, LEGACY_FONT_URL, specifier)
      assert.match(face, /format\(["']?woff2["']?\)/, specifier)
    }
  }
})

test('the Vite plugin runs before core CSS handling and only touches stylesheets', () => {
  const plugin = woff2OnlyFonts()
  assert.equal(plugin.enforce, 'pre')
  const css = '@font-face{src:url(a.woff2) format("woff2"),url(a.ttf) format("truetype")}'
  const transform = plugin.transform
  assert.equal(typeof transform, 'function')
  assert.deepEqual(transform.call({}, css, '/x/katex.min.css?used'), {
    code: '@font-face{src:url(a.woff2) format("woff2")}',
    map: null,
  })
  assert.equal(transform.call({}, css, '/x/module.ts'), null)
  assert.equal(transform.call({}, '.a{}', '/x/plain.css'), null)
})
