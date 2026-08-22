import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import { SITE } from '../src/config/site.ts'
import { generateDiscoveryFiles } from '../src/lib/discovery.ts'
import { getPageMeta } from '../src/lib/pageMeta.ts'
import { PRERENDER_PATHS } from '../src/lib/publicRoutes.ts'
import { renderRouteHead, replaceRouteHead } from '../src/lib/seoHead.ts'
import { renderRouteAssetLinks } from './route-assets.mjs'

export function settleSuspenseMarkup(markup) {
  if (!markup.includes('<!--$?-->')) return markup
  const fragment = JSDOM.fragment(markup)

  while (true) {
    const template = [...fragment.querySelectorAll('template[id^="B:"]')][0]
    if (!template) break

    const segmentId = template.id.replace(/^B:/, 'S:')
    const segment = [...fragment.querySelectorAll('[id]')]
      .find((element) => element.id === segmentId)
    const start = template.previousSibling
    let end = template.nextSibling
    while (!(end?.nodeType === 8 && end.nodeValue === '/$')) end = end?.nextSibling

    if (!segment || start?.nodeType !== 8 || start.nodeValue !== '$?' || !end) {
      throw new Error(`Unable to settle React Suspense segment ${template.id}`)
    }

    start.nodeValue = '$'
    let fallbackNode = template
    while (fallbackNode !== end) {
      const next = fallbackNode.nextSibling
      fallbackNode.remove()
      fallbackNode = next
    }
    while (segment.firstChild) {
      end.parentNode.insertBefore(segment.firstChild, end)
    }
    segment.remove()
  }

  fragment.querySelectorAll('script').forEach((script) => script.remove())
  const container = fragment.ownerDocument.createElement('div')
  container.append(fragment)
  const settled = container.innerHTML
  if (settled.includes('<!--$?-->') || /\sid="(?:B|S):/.test(settled)) {
    throw new Error('React prerender left an unsettled Suspense segment')
  }
  return settled
}

function documentForRoute(template, routeMarkup, routeHead, routeCss) {
  const withHead = replaceRouteHead(template, routeHead)
  const root = '<div id="root"></div>'
  if (!withHead.includes(root)) throw new Error('Built index.html is missing the empty root')
  const missingAssets = routeCss
    .split('\n')
    .filter((line) => {
      const href = line.match(/\shref="([^"]+)"/)?.[1]
      return !href || !withHead.includes(`href="${href}"`)
    })
    .join('\n')
  const withCss = missingAssets
    ? withHead.replace('</head>', `${missingAssets}\n  </head>`)
    : withHead
  // 产物里不注入任何统计 beacon：Cloudflare Web Analytics / RUM 由 Cloudflare
  // 代理自动注入，手工再加一份会让同一次浏览重复计数。scripts/check-html.mjs 锁死这条。
  return withCss.replace(root, `<div id="root">${routeMarkup}</div>`)
}

function writeHtml(path, content) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content, 'utf8')
}

function writeRouteVariants(outDir, path, content) {
  if (path === '/') {
    writeHtml(join(outDir, 'index.html'), content)
    return
  }
  const relative = path.slice(1)
  writeHtml(join(outDir, `${relative}.html`), content)
  writeHtml(join(outDir, relative, 'index.html'), content)
}

export async function prerenderSite(outDir, serverEntry) {
  const site = SITE
  const indexPath = join(outDir, 'index.html')
  const manifestPath = join(outDir, '.vite', 'manifest.json')
  const template = readFileSync(indexPath, 'utf8')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const { renderRoute } = await import(
    `${pathToFileURL(serverEntry).href}?time=${Date.now()}`
  )

  for (const path of PRERENDER_PATHS) {
    const page = getPageMeta(path, site)
    const markup = settleSuspenseMarkup(await renderRoute(path))
    writeRouteVariants(
      outDir,
      path,
      documentForRoute(
        template,
        markup,
        renderRouteHead(page, site),
        renderRouteAssetLinks(manifest, path),
      ),
    )
  }

  const notFoundPath = '/__dp-not-found__'
  const notFound = getPageMeta(notFoundPath, site)
  const notFoundMarkup = settleSuspenseMarkup(await renderRoute(notFoundPath))
  writeHtml(
    join(outDir, '404.html'),
    documentForRoute(
      template,
      notFoundMarkup,
      renderRouteHead(notFound, site),
      renderRouteAssetLinks(manifest, notFoundPath),
    ),
  )

  for (const [name, content] of Object.entries(generateDiscoveryFiles(site))) {
    writeFileSync(join(outDir, name), content, 'utf8')
  }
  rmSync(join(outDir, '.vite'), { recursive: true, force: true })
  console.log(
    `[prerender] ${PRERENDER_PATHS.length} routes hydrated + real 404 + discovery files`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const valueAfter = (flag) => {
    const index = process.argv.indexOf(flag)
    return index >= 0 ? process.argv[index + 1] : undefined
  }
  const outDir = valueAfter('--out-dir')
  const serverEntry = valueAfter('--server-entry')
  if (!outDir || !serverEntry) {
    console.error(
      'Usage: node scripts/prerender.mjs --out-dir <dir> --server-entry <file>',
    )
    process.exit(2)
  }
  await prerenderSite(outDir, serverEntry)
}
