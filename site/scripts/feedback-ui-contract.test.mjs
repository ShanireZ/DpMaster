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
  assert.match(text, /<legend[^>]*className="fbw__sr-only">反馈类型/)
  assert.match(text, /aria-pressed=\{kind === k\}/)
  assert.match(text, /const KINDS: Kind\[\] = \['内容错漏', '显示异常', '其他建议'\]/)
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
  assert.match(text, /result\.status !== ['"]delivered['"]/)
  assert.match(text, /requestId/)
})

test('feedback status changes are announced without exposing forwarding state', async () => {
  const text = await source()
  assert.match(text, /aria-live="polite"/)
  assert.match(text, /role="alert"/)
  assert.match(text, /已收到，谢谢你/)
  assert.doesNotMatch(text, /result\?\.forwarded/)
})

test('route and diagnostic fields are collected automatically without visible controls', async () => {
  const text = await source()
  assert.match(text, /collectDiagnostics/)
  assert.match(text, /userAgentData/)
  assert.match(text, /fullVersionList/)
  assert.match(text, /page:\s*page \|\| pageLabel\(location\.pathname\)/)
  assert.match(text, /path:\s*location\.pathname/)
  assert.doesNotMatch(text, /includeDiagnostics/)
  assert.doesNotMatch(text, /type="checkbox"/)
  assert.doesNotMatch(text, /复现步骤/)
  assert.doesNotMatch(text, /页面名称和路径会随反馈提交/)
})
