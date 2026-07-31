import { PARTS } from '../data/catalog.ts'

export const PUBLIC_PATHS = Object.freeze([
  '/',
  ...PARTS.map((part) => `/part/${part.id}`),
  ...PARTS.flatMap((part) =>
    part.types
      .filter((type) => type.status === 'ready')
      .map((type) => `/part/${part.id}/${type.slug}`),
  ),
  '/method',
  '/problems',
])

export const INTERNAL_PATHS = Object.freeze([
  '/lab/body-demo-standard',
])

export const PRERENDER_PATHS = Object.freeze([
  ...PUBLIC_PATHS,
  ...INTERNAL_PATHS,
])

if (new Set(PUBLIC_PATHS).size !== PUBLIC_PATHS.length) {
  throw new Error('Public route list contains duplicates')
}

if (new Set(PRERENDER_PATHS).size !== PRERENDER_PATHS.length) {
  throw new Error('Prerender route list contains duplicates')
}

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number])
}
