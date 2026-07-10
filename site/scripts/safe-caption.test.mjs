import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const parserUrl = new URL('../src/components/dp-engine/safeCaptionModel.ts', import.meta.url)
const componentUrl = new URL('../src/components/dp-engine/SafeCaption.tsx', import.meta.url)

async function loadParser() {
  try {
    return (await import(parserUrl.href)).parseSafeCaption
  } catch {
    return undefined
  }
}

async function source(url) {
  try {
    return await readFile(url, 'utf8')
  } catch {
    return ''
  }
}

test('SafeCaption preserves the approved teaching emphasis vocabulary', async () => {
  const parseSafeCaption = await loadParser()
  assert.equal(typeof parseSafeCaption, 'function', 'parseSafeCaption must be implemented')

  assert.deepEqual(
    parseSafeCaption('<b>allowed</b><strong>strong</strong><code>x &lt; y</code><br>tail'),
    [
      { tag: 'b', children: ['allowed'] },
      { tag: 'strong', children: ['strong'] },
      { tag: 'code', children: ['x < y'] },
      { tag: 'br', children: [] },
      'tail',
    ],
  )

  for (const className of ['mono', 'ok', 'bad', 'cur', 'you']) {
    assert.deepEqual(
      parseSafeCaption(`<span class="${className}">${className}</span>`),
      [{ tag: 'span', className, children: [className] }],
    )
  }
})

test('SafeCaption renders image, script, and event-bearing markup as text', async () => {
  const parseSafeCaption = await loadParser()
  assert.equal(typeof parseSafeCaption, 'function', 'parseSafeCaption must be implemented')

  for (const html of [
    '<img src=x onerror=alert(1)>',
    '<script>alert(1)</script>',
    '<b onclick="alert(1)">owned</b>',
    '<strong onmouseover="alert(1)">owned</strong>',
    '<span class="mono" onfocus="alert(1)">owned</span>',
  ]) {
    assert.deepEqual(parseSafeCaption(html), [html])
  }
})

test('SafeCaption accepts only one approved static span class', async () => {
  const parseSafeCaption = await loadParser()
  assert.equal(typeof parseSafeCaption, 'function', 'parseSafeCaption must be implemented')

  for (const html of [
    '<span class="mono ok">two classes</span>',
    '<span class="evil">unknown</span>',
    '<span style="color:red">inline style</span>',
    '<span id="mono" class="mono">extra attr</span>',
  ]) {
    assert.deepEqual(parseSafeCaption(html), [html])
  }
})

test('SafeCaption renders malformed and unsupported markup as text', async () => {
  const parseSafeCaption = await loadParser()
  assert.equal(typeof parseSafeCaption, 'function', 'parseSafeCaption must be implemented')

  for (const html of [
    '<b>unclosed',
    '<b><code>crossed</b></code>',
    '<em>unsupported</em>',
    '<a href="https://example.com">link</a>',
    'plain < tail',
  ]) {
    assert.deepEqual(parseSafeCaption(html), [html])
  }
})

test('SafeCaption exposes the required component interface without a raw HTML sink', async () => {
  const text = await source(componentUrl)
  assert.match(text, /html:\s*string/)
  assert.match(text, /className\?:\s*string/)
  assert.match(text, /parseSafeCaption/)
  assert.doesNotMatch(text, /dangerouslySetInnerHTML/)
})

test('warning caption producers use the approved bad class without inline styles', async () => {
  const producers = await Promise.all([
    source(new URL('../src/components/demos/knapsack/solvers.ts', import.meta.url)),
    source(new URL('../src/components/demos/knapsack/groupOrderSolver.ts', import.meta.url)),
  ])
  for (const text of producers) {
    assert.match(text, /<span class="bad">/)
    assert.doesNotMatch(text, /<span\s+style=/)
  }
})
