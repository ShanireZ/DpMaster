import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'dark' | 'light'
interface ThemeCtx {
  theme: Theme
  toggle: () => void
}

const Ctx = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {} })
const KEY = 'dp-master-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 服务端和客户端首次渲染都固定为 dark，保证预渲染 HTML 可无差异水合。
  const [theme, setTheme] = useState<Theme>('dark')
  const hydrated = useRef(false)

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true
      let saved: string | null = null
      try {
        saved = localStorage.getItem(KEY)
      } catch {
        /* ignore */
      }
      if (saved === 'light') setTheme('light')
      else document.documentElement.dataset.theme = 'dark'
      return
    }
    document.documentElement.dataset.theme = theme
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'light' ? '#f4f1ea' : '#0b0a09',
    )
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(Ctx)
