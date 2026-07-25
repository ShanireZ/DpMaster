import { StrictMode } from 'react'
import { prerender } from 'react-dom/static'
import { StaticApp } from './app/App.tsx'

export async function renderRoute(pathname: string): Promise<string> {
  const errors: unknown[] = []
  const { prelude } = await prerender(
    <StrictMode>
      <StaticApp url={pathname} />
    </StrictMode>,
    {
      onError(error) {
        errors.push(error)
      },
    },
  )
  const html = await new Response(prelude).text()
  if (errors.length > 0) {
    throw new AggregateError(errors, `React prerender failed for ${pathname}`)
  }
  return html
}
