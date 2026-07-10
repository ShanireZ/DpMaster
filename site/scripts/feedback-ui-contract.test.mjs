import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const widgetPath = new URL('../src/components/feedback/FeedbackWidget.tsx', import.meta.url)

async function source() {
  return readFile(widgetPath, 'utf8')
}

test('feedback kind selector exposes a named pressed-button group', async () => {
  const text = await source()
  assert.match(text, /<fieldset[^>]*className="fbw__field"/)
  assert.match(text, /<legend[^>]*className="fbw__label"/)
  assert.match(text, /aria-pressed=\{kind === k\}/)
})

test('feedback dialog traps focus, locks scroll, and restores the trigger', async () => {
  const text = await source()
  assert.match(text, /ref=\{triggerRef\}/)
  assert.match(text, /document\.body\.style\.overflow\s*=\s*['"]hidden['"]/)
  assert.match(text, /e\.key === ['"]Tab['"]/)
  assert.match(text, /querySelectorAll<HTMLElement>/)
  assert.match(text, /triggerRef\.current\?\.focus\(\)/)
})

test('feedback client reads the JSON receipt and presents rate limits clearly', async () => {
  const text = await source()
  assert.match(text, /await res\.json\(\)/)
  assert.match(text, /res\.status === 429/)
  assert.match(text, /提交太频繁，请稍后再试/)
  assert.match(text, /result\?\.ok/)
})

test('feedback status changes are announced without exposing forwarding state', async () => {
  const text = await source()
  assert.match(text, /aria-live="polite"/)
  assert.match(text, /role="alert"/)
  assert.match(text, /已收到，谢谢你/)
  assert.doesNotMatch(text, /result\?\.forwarded/)
})
