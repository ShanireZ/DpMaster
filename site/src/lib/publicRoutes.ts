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
  '/about',
])

if (new Set(PUBLIC_PATHS).size !== PUBLIC_PATHS.length) {
  throw new Error('Public route list contains duplicates')
}

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number])
}
