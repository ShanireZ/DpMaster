import { BrowserRouter } from 'react-router-dom'
import { StaticLessonContentProvider } from './StaticLessonContentContext.tsx'
import type { StaticLessonContents } from './StaticLessonContent.ts'
import { CLIENT_ROUTE_VIEWS, type RouteViews } from './routeViews.ts'
import { AppContent } from './AppContent.tsx'

export default function App({
  initialLessonContents = {},
  views,
}: {
  initialLessonContents?: StaticLessonContents
  views?: RouteViews
}) {
  return (
    <BrowserRouter>
      <StaticLessonContentProvider contents={initialLessonContents}>
        <AppContent views={views ?? CLIENT_ROUTE_VIEWS} />
      </StaticLessonContentProvider>
    </BrowserRouter>
  )
}
