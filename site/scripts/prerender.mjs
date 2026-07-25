import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { getSiteConfig } from '../src/config/site.ts'
import { generateDiscoveryFiles } from '../src/lib/discovery.ts'
import { getPageMeta } from '../src/lib/pageMeta.ts'
import { PUBLIC_PATHS } from '../src/lib/publicRoutes.ts'
import { renderRouteHead, replaceRouteHead } from '../src/lib/seoHead.ts'

function documentForRoute(template, routeMarkup, routeHead) {
  const withHead = replaceRouteHead(template, routeHead)
  const root = '<div id="root"></div>'
  if (!withHead.includes(root)) throw new Error('Built index.html is missing the empty root')
  return withHead.replace(root, `<div id="root">${routeMarkup}</div>`)
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
  const template = readFileSync(indexPath, 'utf8')
  const { renderRoute } = await import(
    `${pathToFileURL(serverEntry).href}?region=${region}&time=${Date.now()}`
  )

  for (const path of PUBLIC_PATHS) {
    const page = getPageMeta(path, site)
    const markup = await renderRoute(path)
    writeRouteVariants(
      outDir,
      path,
      documentForRoute(template, markup, renderRouteHead(page, site)),
    )
  }

  const notFoundPath = '/__dp-not-found__'
  const notFound = getPageMeta(notFoundPath, site)
  const notFoundMarkup = await renderRoute(notFoundPath)
  writeHtml(
    join(outDir, '404.html'),
    documentForRoute(template, notFoundMarkup, renderRouteHead(notFound, site)),
  )

  for (const [name, content] of Object.entries(generateDiscoveryFiles(site))) {
    writeFileSync(join(outDir, name), content, 'utf8')
  }
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
