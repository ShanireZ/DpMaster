import assert from 'node:assert/strict'
import test from 'node:test'
import { forwardWebhook } from '../worker/webhook-core.js'
import { decodeChunked, parseHttpResponse, postOverSocket } from '../worker/socket-fetch.js'

const WEBHOOK = 'https://oapi.dingtalk.com/robot/send?access_token=fake'

/** 构造一个 connect() 替身，记录写出的字节并回放一段响应。 */
function fakeConnect(responseText, { onWrite, failOpen } = {}) {
  return () => {
    if (failOpen) throw new Error(failOpen)
    let reads = 0
    return {
      opened: Promise.resolve({}),
      writable: {
        getWriter: () => ({
          write: async (chunk) => onWrite?.(new TextDecoder().decode(chunk)),
          releaseLock: () => {},
        }),
      },
      readable: {
        getReader: () => ({
          read: async () =>
            reads++ === 0
              ? { value: new TextEncoder().encode(responseText), done: false }
              : { value: undefined, done: true },
          releaseLock: () => {},
        }),
      },
      close: async () => {},
    }
  }
}

const okResponse = [
  'HTTP/1.1 200 OK',
  'Content-Type: application/json',
  'Content-Length: 15',
  '',
  '{"errcode":0}  ',
].join('\r\n')

test('parseHttpResponse reads the status line, headers and body', () => {
  const parsed = parseHttpResponse(new TextEncoder().encode(okResponse))
  assert.equal(parsed.status, 200)
  assert.equal(parsed.statusLine, 'HTTP/1.1 200 OK')
  assert.equal(parsed.headers['content-type'], 'application/json')
  assert.match(parsed.body, /"errcode":0/)
})

test('decodeChunked reassembles a chunked body and stops at the zero chunk', () => {
  const chunked = ['5', 'hello', '5', 'world', '0', '', ''].join('\r\n')
  assert.equal(decodeChunked(chunked), 'helloworld')
})

test('postOverSocket refuses plaintext http and missing runtime support', async () => {
  await assert.rejects(
    () => postOverSocket({ url: 'http://example.test/x', body: '{}', connect: fakeConnect(okResponse) }),
    /https only/,
  )
  await assert.rejects(
    () => postOverSocket({ url: 'https://example.test/x', body: '{}', connect: null }),
    /cloudflare:sockets unavailable/,
  )
})

test('postOverSocket sends path, query, host and a byte-accurate Content-Length', async () => {
  let sent = ''
  // 请求体带多字节字符：Content-Length 必须是字节数而不是字符数。
  const body = JSON.stringify({ msgtype: 'text', text: { content: '状态转移' } })
  await postOverSocket({
    url: 'https://oapi.dingtalk.com/robot/send?access_token=abc&sign=x%2By',
    body,
    connect: fakeConnect(okResponse, { onWrite: (chunk) => { sent = chunk } }),
  })
  assert.match(sent, /^POST \/robot\/send\?access_token=abc&sign=x%2By HTTP\/1\.1/)
  assert.match(sent, /Host: oapi\.dingtalk\.com/)
  assert.match(sent, /Connection: close/)
  const declared = Number(sent.match(/Content-Length: (\d+)/)[1])
  assert.equal(declared, new TextEncoder().encode(body).byteLength)
  assert.notEqual(declared, body.length, 'UTF-16 长度与字节长度必须不同，否则这条断言测不出东西')
})

test('a 525 from fetch falls back to the socket transport and succeeds', async () => {
  const result = await forwardWebhook({
    baseUrl: WEBHOOK,
    kind: 'dingtalk',
    text: 'hello',
    fetchImpl: async () => new Response('an error occurred', { status: 525 }),
    connectImpl: fakeConnect(okResponse),
  })
  assert.equal(result.status, 'forwarded')
  assert.equal(result.code, 200)
  assert.equal(result.transport, 'socket')
})

test('a thrown fetch also falls back to the socket transport', async () => {
  const result = await forwardWebhook({
    baseUrl: WEBHOOK,
    kind: 'dingtalk',
    text: 'hello',
    fetchImpl: async () => {
      throw new TypeError('Network connection lost')
    },
    connectImpl: fakeConnect(okResponse),
  })
  assert.equal(result.status, 'forwarded')
  assert.equal(result.transport, 'socket')
})

test('the socket transport surfaces DingTalk business errors like fetch does', async () => {
  const rejected = [
    'HTTP/1.1 200 OK',
    'Content-Type: application/json',
    '',
    '{"errcode":300001,"errmsg":"token is not exist"}',
  ].join('\r\n')
  const result = await forwardWebhook({
    baseUrl: WEBHOOK,
    kind: 'dingtalk',
    text: 'hello',
    fetchImpl: async () => new Response('', { status: 525 }),
    connectImpl: fakeConnect(rejected),
  })
  assert.equal(result.status, 'business_error')
  assert.equal(result.code, 300001)
  assert.equal(result.message, 'token is not exist')
  assert.equal(result.transport, 'socket')
})

test('★ an ordinary origin error is NOT retried over the socket', async () => {
  // 503 是对端应用层的回复，不是 CF 到源站那一跳失败。换出口重试没有意义，
  // 而且对托管在 Cloudflare 后面的 webhook（Discord / Slack）必然失败。
  let socketUsed = false
  const result = await forwardWebhook({
    baseUrl: 'https://discord.example/api/webhooks/x',
    kind: 'discord',
    text: 'hello',
    fetchImpl: async () => new Response('nope', { status: 503 }),
    connectImpl: () => {
      socketUsed = true
      throw new Error('socket should never be attempted here')
    },
  })
  assert.equal(socketUsed, false)
  assert.equal(result.status, 'http_error')
  assert.equal(result.code, 503)
  assert.equal(result.transport, 'fetch')
})

test('★ a successful fetch never touches the socket transport', async () => {
  let socketUsed = false
  const result = await forwardWebhook({
    baseUrl: 'https://discord.example/api/webhooks/x',
    kind: 'discord',
    text: 'hello',
    // ★ 204 是 null-body 状态，new Response('', {status:204}) 会抛 —— 那样测的
    // 就是「fetch 抛异常」而不是「fetch 成功」，必须传 null。
    fetchImpl: async () => new Response(null, { status: 204 }),
    connectImpl: () => {
      socketUsed = true
      throw new Error('socket should never be attempted here')
    },
  })
  assert.equal(socketUsed, false)
  assert.equal(result.status, 'forwarded')
  assert.equal(result.transport, 'fetch')
})

test('when both transports fail the report names both', async () => {
  const result = await forwardWebhook({
    baseUrl: WEBHOOK,
    kind: 'dingtalk',
    text: 'hello',
    fetchImpl: async () => new Response('', { status: 525 }),
    connectImpl: fakeConnect('', { failOpen: 'connect refused' }),
  })
  assert.equal(result.status, 'http_error')
  assert.equal(result.code, 525)
  assert.equal(result.transport, 'fetch+socket')
})

test('the socket fallback keeps the DingTalk signature that fetch would have used', async () => {
  let sent = ''
  await forwardWebhook({
    baseUrl: 'https://oapi.dingtalk.com/robot/send?access_token=abc',
    kind: 'dingtalk',
    secret: 'SECtest',
    text: 'hello',
    now: () => 1_700_000_000_000,
    fetchImpl: async () => new Response('', { status: 525 }),
    connectImpl: fakeConnect(okResponse, { onWrite: (chunk) => { sent = chunk } }),
  })
  // 加签是在选出口之前算的，所以降级后 timestamp/sign 必须原样带上。
  assert.match(sent, /timestamp=1700000000000/)
  assert.match(sent, /&sign=/)
})
