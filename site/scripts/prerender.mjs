import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import { getSiteConfig } from '../src/config/site.ts'
import { generateDiscoveryFiles } from '../src/lib/discovery.ts'
import { getPageMeta } from '../src/lib/pageMeta.ts'
import { PUBLIC_PATHS } from '../src/lib/publicRoutes.ts'
import { renderRouteHead, replaceRouteHead } from '../src/lib/seoHead.ts'
import { renderRouteAssetLinks } from './route-assets.mjs'

const CLOUDFLARE_WEB_ANALYTICS_SRC =
  'https://static.cloudflareinsights.com/beacon.min.js'

export function renderStaticWebAnalytics(site) {
  const webAnalytics = site.analytics.cloudflareWebAnalytics
  if (webAnalytics.delivery !== 'static') return ''
  return `<!-- Cloudflare Web Analytics --><script type='module' src='${CLOUDFLARE_WEB_ANALYTICS_SRC}' data-cf-beacon='{"token": "${webAnalytics.token}"}'></script><!-- End Cloudflare Web Analytics -->`
}

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

function documentForRoute(
  template,
  routeMarkup,
  routeHead,
  routeCss,
  staticAnalytics,
) {
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
  const withMarkup = withCss.replace(root, `<div id="root">${routeMarkup}</div>`)
  return staticAnalytics
    ? withMarkup.replace('</body>', `    ${staticAnalytics}\n  </body>`)
    : withMarkup
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

export async function prerenderRegion(region, outDir, serverEntry) {
  const site = getSiteConfig(region)
  const indexPath = join(outDir, 'index.html')
  const manifestPath = join(outDir, '.vite', 'manifest.json')
  const template = readFileSync(indexPath, 'utf8')
    .replace('<html lang="zh-CN">', `<html lang="${site.language}">`)
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const staticAnalytics = renderStaticWebAnalytics(site)
  const { renderRoute } = await import(
    `${pathToFileURL(serverEntry).href}?region=${region}&time=${Date.now()}`
  )

  for (const path of PUBLIC_PATHS) {
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
        staticAnalytics,
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
      staticAnalytics,
    ),
  )

  for (const [name, content] of Object.entries(generateDiscoveryFiles(site))) {
    writeFileSync(join(outDir, name), content, 'utf8')
  }
  rmSync(join(outDir, '.vite'), { recursive: true, force: true })
  console.log(
    `[prerender] ${region}: ${PUBLIC_PATHS.length} routes hydrated + real 404 + discovery files`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const valueAfter = (flag) => {
    const index = process.argv.indexOf(flag)
    return index >= 0 ? process.argv[index + 1] : undefined
  }
  const region = valueAfter('--region')
  const outDir = valueAfter('--out-dir')
  const serverEntry = valueAfter('--server-entry')
  if (
    !['international', 'china'].includes(region) ||
    !outDir ||
    !serverEntry
  ) {
    console.error(
      'Usage: node scripts/prerender.mjs --region <international|china> --out-dir <dir> --server-entry <file>',
    )
    process.exit(2)
  }
  await prerenderRegion(region, outDir, serverEntry)
}
