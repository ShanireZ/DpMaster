import { lazy, type ComponentType } from 'react'

export interface RouteViews {
  Home: ComponentType
  PartPage: ComponentType
  TypePage: ComponentType
  NotFound: ComponentType
  MethodPage: ComponentType
  ProblemsPage: ComponentType
  BodyDemoStandardPage: ComponentType
}

const PAGE_LOADERS = {
  Home: () => import('../pages/Home'),
  PartPage: () => import('../pages/PartPage'),
  TypePage: () => import('../pages/TypePage'),
  NotFound: () => import('../pages/NotFound'),
  MethodPage: () => import('../pages/MethodPage'),
  ProblemsPage: () => import('../pages/ProblemsPage'),
  BodyDemoStandardPage: () => import('../pages/BodyDemoStandardPage'),
}

function getRouteViewKey(pathname: string): keyof RouteViews {
  return pathname === '/'
    ? 'Home'
    : /^\/part\/[a-g]\/[^/]+$/.test(pathname)
      ? 'TypePage'
      : /^\/part\/[a-g]$/.test(pathname)
        ? 'PartPage'
        : pathname === '/method'
          ? 'MethodPage'
          : pathname === '/problems'
            ? 'ProblemsPage'
            : pathname === '/lab/body-demo-standard'
              ? 'BodyDemoStandardPage'
            : 'NotFound'
}

export const CLIENT_ROUTE_VIEWS: RouteViews = {
  Home: lazy(PAGE_LOADERS.Home),
  PartPage: lazy(PAGE_LOADERS.PartPage),
  TypePage: lazy(PAGE_LOADERS.TypePage),
  NotFound: lazy(PAGE_LOADERS.NotFound),
  MethodPage: lazy(PAGE_LOADERS.MethodPage),
  ProblemsPage: lazy(PAGE_LOADERS.ProblemsPage),
  BodyDemoStandardPage: lazy(PAGE_LOADERS.BodyDemoStandardPage),
}

export async function loadInitialRouteViews(pathname: string): Promise<RouteViews> {
  const key = getRouteViewKey(pathname)
  const module = await PAGE_LOADERS[key]()
  return { ...CLIENT_ROUTE_VIEWS, [key]: module.default }
}
