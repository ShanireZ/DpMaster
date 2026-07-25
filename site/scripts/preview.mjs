import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'

const args = process.argv.slice(2)
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}
const host = valueAfter('--host', '127.0.0.1')
const port = Number(valueAfter('--port', '4173'))
const region = valueAfter('--region', 'international')
const root = resolve(region === 'china' ? 'dist/edgeone' : 'dist/cloudflare')

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
}

function safeFile(relative) {
  const path = resolve(root, normalize(relative).replace(/^[/\\]+/, ''))
  return path === root || path.startsWith(`${root}${sep}`) ? path : null
}

function candidateFor(pathname) {
  const decoded = decodeURIComponent(pathname)
  const relative = decoded === '/' ? 'index.html' : decoded.slice(1)
  const candidates = [
    relative,
    `${relative}.html`,
    join(relative, 'index.html'),
  ]
  return candidates
    .map(safeFile)
    .find((path) => path && existsSync(path) && statSync(path).isFile())
}

const server = createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || host}`)
  if (url.pathname === '/api/analytics') {
    response.writeHead(request.method === 'POST' ? 204 : 405, {
      Allow: 'POST',
      'Cache-Control': 'no-store',
    })
    response.end()
    return
  }

  let file
  try {
    file = candidateFor(url.pathname)
  } catch {
    file = null
  }
  const status = file ? 200 : 404
  const target = file ?? join(root, '404.html')
  response.writeHead(status, {
    'Content-Type': contentTypes[extname(target)] ?? 'application/octet-stream',
    'Cache-Control': extname(target) === '.html' ? 'no-store' : 'public, max-age=3600',
  })
  if (request.method === 'HEAD') {
    response.end()
    return
  }
  createReadStream(target).pipe(response)
})

server.listen(port, host, () => {
  console.log(`[preview] ${region} listening on http://${host}:${port}`)
})
