import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import worker from '../worker.js'
import { onRequestOptions, onRequestPost } from '../functions/api/feedback.js'

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..')

test('Cloudflare worker keeps the feedback route method-safe', async () => {
  const env = { ASSETS: { fetch: async () => new Response('asset') } }
  const get = await worker.fetch(new Request('https://dp.betaoi.cc/api/feedback'), env)
  assert.equal(get.status, 405)
  assert.equal(get.headers.get('Allow'), 'POST')

  const options = await worker.fetch(
    new Request('https://dp.betaoi.cc/api/feedback', { method: 'OPTIONS' }),
    env,
  )
  assert.equal(options.status, 204)

  const asset = await worker.fetch(new Request('https://dp.betaoi.cc/part/a'), env)
  assert.equal(await asset.text(), 'asset')
})

test('Pages adapter delegates POST and supports OPTIONS', async () => {
  const post = await onRequestPost({
    request: new Request('https://dp.betaoi.cc/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: '内容有误', description: '有效反馈内容' }),
    }),
    env: {},
  })
  assert.equal(post.status, 200)
  assert.equal((await post.json()).status, 'logged')
  assert.equal((await onRequestOptions()).status, 204)
})

test('EdgeOne generator strips every export from the inlined core', () => {
  const source = readFileSync(join(siteDir, 'scripts', 'postbuild.mjs'), 'utf8')
  assert.match(source, /replace\(\/\^export \/gm, ''\)/)
})

test('EdgeOne feedback exceptions return JSON instead of SPA HTML', () => {
  const source = readFileSync(join(siteDir, 'scripts', 'postbuild.mjs'), 'utf8')
  assert.match(source, /error:\s*['"]internal['"]/)
  assert.match(source, /反馈服务暂时不可用/)
  assert.doesNotMatch(source, /反馈分支异常.+SPA 兜底/)
})
