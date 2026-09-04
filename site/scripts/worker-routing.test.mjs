import assert from 'node:assert/strict'
import test from 'node:test'
import worker from '../worker.js'

const ORIGIN = 'https://dp.round1.cc'

function assetsEnv(extra = {}) {
  return { ASSETS: { fetch: async () => new Response('asset') }, ...extra }
}

test('the worker keeps the feedback route method-safe and leaves assets alone', async () => {
  const env = assetsEnv()
  const get = await worker.fetch(new Request(`${ORIGIN}/api/feedback`), env)
  assert.equal(get.status, 405)
  assert.equal(get.headers.get('Allow'), 'POST')

  const options = await worker.fetch(
    new Request(`${ORIGIN}/api/feedback`, { method: 'OPTIONS' }),
    env,
  )
  assert.equal(options.status, 204)

  const asset = await worker.fetch(new Request(`${ORIGIN}/part/a`), env)
  assert.equal(await asset.text(), 'asset')
})

test('a public route can negotiate its internal Markdown representation', async () => {
  let requestedPath = null
  const env = {
    ASSETS: {
      fetch: async (request) => {
        requestedPath = new URL(request.url).pathname
        return new Response('# 背包 DP\n', {
          headers: { ETag: '"markdown-part-a"' },
        })
      },
    },
  }

  const response = await worker.fetch(
    new Request(`${ORIGIN}/part/a`, {
      headers: { Accept: 'text/markdown' },
    }),
    env,
  )

  assert.equal(requestedPath, '/_representations/markdown/part/a.md')
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Content-Type'), 'text/markdown; charset=utf-8')
  assert.equal(response.headers.get('Content-Language'), 'zh-CN')
  assert.equal(
    response.headers.get('Content-Signal'),
    'search=yes, ai-train=no, ai-input=yes',
  )
  assert.equal(response.headers.get('Vary'), 'Accept')
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=0, must-revalidate')
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff')
  assert.match(response.headers.get('Link'), /rel="canonical"/)
  assert.equal(await response.text(), '# 背包 DP\n')
})

test('the Worker preserves representation validators before edge transforms', async () => {
  const env = {
    ASSETS: {
      fetch: async (request) => {
        const markdown = new URL(request.url).pathname.startsWith(
          '/_representations/markdown/',
        )
        return new Response(markdown ? '# 背包 DP\n' : '<main>背包 DP</main>', {
          headers: {
            ETag: markdown ? '"markdown-etag"' : '"html-etag"',
          },
        })
      },
    },
  }

  const html = await worker.fetch(
    new Request(`${ORIGIN}/part/a`, { headers: { Accept: 'text/html' } }),
    env,
  )
  const markdown = await worker.fetch(
    new Request(`${ORIGIN}/part/a`, { headers: { Accept: 'text/markdown' } }),
    env,
  )

  assert.equal(html.headers.get('ETag'), '"html-etag"')
  assert.equal(markdown.headers.get('ETag'), '"markdown-etag"')
})

test('public route HTTP responses apply the approved Accept selection matrix', async () => {
  const vectors = [
    [null, '/part/a', 200],
    ['text/html', '/part/a', 200],
    ['text/markdown', '/_representations/markdown/part/a.md', 200],
    ['text/markdown, */*;q=0.5', '/_representations/markdown/part/a.md', 200],
    ['text/html;q=1, text/markdown;q=0.8', '/part/a', 200],
    ['text/html;q=0, text/markdown;q=1', '/_representations/markdown/part/a.md', 200],
    ['text/*', '/part/a', 200],
    ['*/*', '/part/a', 200],
    ['text/html;q=0, text/markdown;q=0', null, 406],
    ['application/json', null, 406],
    ['text/markdown;q=0, */*;q=1', '/part/a', 200],
    ['not-a-media-range, text/html', '/part/a', 200],
    ['not-a-media-range', null, 406],
    ['text/markdown;q=1;charset=iso-8859-1, text/html;q=0.5', '/part/a', 200],
    ['text/markdown;q=1;charset=utf-8, text/html;q=0.5', '/_representations/markdown/part/a.md', 200],
    ['text/markdown;charset =utf-8, text/html;q=0.5', '/part/a', 200],
    ['text/markdown;;q=1, text/html;q=0.5', '/_representations/markdown/part/a.md', 200],
    ['text/markdown;q=1;foo, text/html;q=0.5', '/part/a', 200],
  ]

  for (const [accept, expectedPath, expectedStatus] of vectors) {
    const label = accept ?? '<missing>'
    const requested = []
    const env = {
      ASSETS: {
        fetch: async (request) => {
          const path = new URL(request.url).pathname
          const etag = path.startsWith('/_representations/markdown/')
            ? '"markdown-etag"'
            : '"html-etag"'
          requested.push({ path, method: request.method })
          if (request.headers.get('If-None-Match') === etag) {
            return new Response(null, { status: 304, headers: { ETag: etag } })
          }
          return new Response(`asset:${path}`, { headers: { ETag: etag } })
        },
      },
    }
    const headers = accept === null ? {} : { Accept: accept }
    const get = await worker.fetch(new Request(`${ORIGIN}/part/a`, { headers }), env)

    assert.equal(get.status, expectedStatus, label)
    assert.equal(requested[0]?.path ?? null, expectedPath, label)
    assert.equal(get.headers.get('Vary'), 'Accept', label)
    if (expectedStatus === 200) {
      assert.equal(
        get.headers.get('Cache-Control'),
        'public, max-age=0, must-revalidate',
        label,
      )
      assert.equal(
        get.headers.get('Content-Signal'),
        'search=yes, ai-train=no, ai-input=yes',
        label,
      )
    }

    const head = await worker.fetch(
      new Request(`${ORIGIN}/part/a`, { method: 'HEAD', headers }),
      env,
    )
    assert.equal(head.status, expectedStatus, `${label} HEAD`)
    assert.equal(await head.text(), '', `${label} HEAD body`)
    if (expectedStatus === 200) {
      assert.deepEqual(
        requested[1],
        { path: expectedPath, method: 'HEAD' },
        `${label} HEAD representation`,
      )
    } else {
      assert.equal(requested.length, 0, `${label} HEAD asset bypass`)
    }
    for (const header of [
      'Cache-Control',
      'Content-Language',
      'Content-Signal',
      'Content-Type',
      'ETag',
      'Link',
      'Vary',
      'X-Content-Type-Options',
      'X-Robots-Tag',
    ]) {
      assert.equal(
        head.headers.get(header),
        get.headers.get(header),
        `${label} HEAD ${header}`,
      )
    }

    const conditionalHeaders = new Headers(headers)
    conditionalHeaders.set(
      'If-None-Match',
      expectedPath?.startsWith('/_representations/markdown/')
        ? '"markdown-etag"'
        : '"html-etag"',
    )
    const conditional = await worker.fetch(
      new Request(`${ORIGIN}/part/a`, { headers: conditionalHeaders }),
      env,
    )
    assert.equal(
      conditional.status,
      expectedStatus === 200 ? 304 : 406,
      `${label} conditional`,
    )
    assert.equal(conditional.headers.get('Vary'), 'Accept', `${label} conditional Vary`)
    if (expectedStatus === 200) {
      assert.deepEqual(
        requested[2],
        { path: expectedPath, method: 'GET' },
        `${label} conditional representation`,
      )
      assert.equal(
        conditional.headers.get('ETag'),
        get.headers.get('ETag'),
        `${label} conditional ETag`,
      )
    } else {
      assert.equal(requested.length, 0, `${label} conditional asset bypass`)
    }
  }
})

test('HEAD and conditional requests stay isolated to the selected representation', async () => {
  const seen = []
  const env = {
    ASSETS: {
      fetch: async (request) => {
        const path = new URL(request.url).pathname
        const etag = path.startsWith('/_representations/markdown/')
          ? '"markdown-etag"'
          : '"html-etag"'
        seen.push({ path, method: request.method, ifNoneMatch: request.headers.get('If-None-Match') })
        if (request.headers.get('If-None-Match') === etag) {
          return new Response(null, { status: 304, headers: { ETag: etag } })
        }
        return new Response(request.method === 'HEAD' ? null : path, {
          headers: { ETag: etag, Vary: 'Accept-Encoding' },
        })
      },
    },
  }

  const head = await worker.fetch(
    new Request(`${ORIGIN}/part/a`, {
      method: 'HEAD',
      headers: { Accept: 'text/markdown' },
    }),
    env,
  )
  assert.deepEqual(seen[0], {
    path: '/_representations/markdown/part/a.md',
    method: 'HEAD',
    ifNoneMatch: null,
  })
  assert.equal(head.status, 200)
  assert.equal(head.headers.get('ETag'), '"markdown-etag"')
  assert.equal(head.headers.get('Vary'), 'Accept-Encoding, Accept')
  assert.equal(await head.text(), '')

  const wrongValidator = await worker.fetch(
    new Request(`${ORIGIN}/part/a`, {
      headers: {
        Accept: 'text/markdown',
        'If-None-Match': '"html-etag"',
      },
    }),
    env,
  )
  assert.equal(wrongValidator.status, 200)
  assert.equal(await wrongValidator.text(), '/_representations/markdown/part/a.md')

  const matchingValidator = await worker.fetch(
    new Request(`${ORIGIN}/part/a`, {
      headers: {
        Accept: 'text/markdown',
        'If-None-Match': '"markdown-etag"',
      },
    }),
    env,
  )
  assert.equal(matchingValidator.status, 304)
  assert.equal(matchingValidator.headers.get('ETag'), '"markdown-etag"')
  assert.equal(await matchingValidator.text(), '')
})

test('internal representations are hidden and non-public paths keep their existing behavior', async () => {
  const seen = []
  const env = {
    ASSETS: {
      fetch: async (request) => {
        seen.push(new URL(request.url).pathname)
        return new Response('asset')
      },
    },
  }

  const hidden = await worker.fetch(
    new Request(`${ORIGIN}/_representations/markdown/part/a.md`),
    env,
  )
  assert.equal(hidden.status, 404)
  assert.equal(hidden.headers.get('X-Robots-Tag'), 'noindex, nofollow')
  assert.deepEqual(seen, [])

  for (const path of ['/lab/body-demo-standard', '/assets/app.js', '/not-a-route']) {
    const response = await worker.fetch(
      new Request(`${ORIGIN}${path}`, { headers: { Accept: 'text/markdown' } }),
      env,
    )
    assert.equal(response.status, 200, path)
    assert.equal(response.headers.get('Vary'), null, path)
  }
  assert.deepEqual(seen, ['/lab/body-demo-standard', '/assets/app.js', '/not-a-route'])

  const api = await worker.fetch(
    new Request(`${ORIGIN}/api/feedback`, { headers: { Accept: 'text/markdown' } }),
    env,
  )
  assert.equal(api.status, 405)
  assert.deepEqual(seen, ['/lab/body-demo-standard', '/assets/app.js', '/not-a-route'])
})

test('the worker is the only deployment adapter: no Pages or EdgeOne entry points remain', async () => {
  const { readdir } = await import('node:fs/promises')
  const entries = await readdir(new URL('../', import.meta.url))
  assert.equal(entries.includes('functions'), false)
  assert.equal(entries.includes('.edgeone'), false)

  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../worker.js', import.meta.url), 'utf8'),
  )
  assert.match(source, /env\.ASSETS\.fetch\(request\)/)
  assert.doesNotMatch(source, /functions\//)
})

test('the egress probe does not exist until EGRESS_DIAG_SECRET is configured', async () => {
  const probe = await worker.fetch(
    new Request(`${ORIGIN}/api/_diag/egress`, {
      method: 'POST',
      headers: { 'x-dp-diag-secret': 'anything' },
    }),
    assetsEnv(),
  )
  // 落回静态资源 —— 与任何其他未知路径完全一样，不泄露端点是否存在。
  assert.equal(await probe.text(), 'asset')
})

test('the egress probe rejects a wrong secret the same way it rejects an unknown path', async () => {
  const probe = await worker.fetch(
    new Request(`${ORIGIN}/api/_diag/egress`, {
      method: 'POST',
      headers: { 'x-dp-diag-secret': 'wrong-secret' },
    }),
    assetsEnv({ EGRESS_DIAG_SECRET: 'right-secret' }),
  )
  assert.equal(await probe.text(), 'asset')

  const missingHeader = await worker.fetch(
    new Request(`${ORIGIN}/api/_diag/egress`, { method: 'POST' }),
    assetsEnv({ EGRESS_DIAG_SECRET: 'right-secret' }),
  )
  assert.equal(await missingHeader.text(), 'asset')
})

test('the egress probe is POST-only once authenticated', async () => {
  const probe = await worker.fetch(
    new Request(`${ORIGIN}/api/_diag/egress`, {
      method: 'GET',
      headers: { 'x-dp-diag-secret': 'right-secret' },
    }),
    assetsEnv({ EGRESS_DIAG_SECRET: 'right-secret' }),
  )
  assert.equal(probe.status, 405)
  assert.equal(probe.headers.get('Allow'), 'POST')
})
