import { BrowserRouter } from 'react-router-dom'
import { StaticLessonContentProvider } from './StaticLessonContentContext.tsx'
import type { StaticLessonContents } from './StaticLessonContent.ts'
import { StaticFamilyArtProvider } from '../components/art/StaticFamilyArtContext.tsx'
import type { StaticFamilyArtModules } from '../components/art/familyArtRegistry.ts'
import { CLIENT_ROUTE_VIEWS, type RouteViews } from './routeViews.ts'
import { AppContent } from './AppContent.tsx'

export default function App({
  initialFamilyArt = {},
  initialLessonContents = {},
  views,
}: {
  initialFamilyArt?: StaticFamilyArtModules
  initialLessonContents?: StaticLessonContents
  views?: RouteViews
}) {
  return (
    <BrowserRouter>
      <StaticFamilyArtProvider modules={initialFamilyArt}>
        <StaticLessonContentProvider contents={initialLessonContents}>
          <AppContent views={views ?? CLIENT_ROUTE_VIEWS} />
        </StaticLessonContentProvider>
      </StaticFamilyArtProvider>
    </BrowserRouter>
  )
}
