import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { PARTS } from '../data/catalog.ts'

const STORAGE_KEY = 'dp-master-progress:v1'
const LESSON_PATHS = new Set(
  PARTS.flatMap((part) =>
    part.types
      .filter((type) => type.status === 'ready')
      .map((type) => `/part/${part.id}/${type.slug}`),
  ),
)

interface StoredProgress {
  completed: string[]
  lastVisited: string | null
}

interface LearningProgressValue extends StoredProgress {
  hydrated: boolean
  visit(path: string): void
  markComplete(path: string): void
  toggleComplete(path: string): void
}

const EMPTY: StoredProgress = { completed: [], lastVisited: null }
const Context = createContext<LearningProgressValue>({
  ...EMPTY,
  hydrated: false,
  visit: () => {},
  markComplete: () => {},
  toggleComplete: () => {},
})

function parseStoredProgress(raw: string | null): StoredProgress {
  if (!raw) return EMPTY
  try {
    const value = JSON.parse(raw) as Partial<StoredProgress>
    return {
      completed: Array.isArray(value.completed)
        ? [...new Set(value.completed.filter((item): item is string => (
          typeof item === 'string' && LESSON_PATHS.has(item)
        )))]
        : [],
      lastVisited: typeof value.lastVisited === 'string' ? value.lastVisited : null,
    }
  } catch {
    return EMPTY
  }
}

export function LearningProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<StoredProgress>(EMPTY)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      // 禁用本地存储时仍可正常学习，只是不跨会话保存进度。
    }
    setProgress(parseStoredProgress(stored))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // 存储失败不影响课程交互。
    }
  }, [hydrated, progress])

  const visit = useCallback((path: string) => {
    setProgress((current) => (
      current.lastVisited === path ? current : { ...current, lastVisited: path }
    ))
  }, [])

  const markComplete = useCallback((path: string) => {
    setProgress((current) => (
      current.completed.includes(path)
        ? current
        : { ...current, completed: [...current.completed, path] }
    ))
  }, [])

  const toggleComplete = useCallback((path: string) => {
    setProgress((current) => ({
      ...current,
      completed: current.completed.includes(path)
        ? current.completed.filter((item) => item !== path)
        : [...current.completed, path],
    }))
  }, [])

  const value = useMemo(
    () => ({ ...progress, hydrated, visit, markComplete, toggleComplete }),
    [hydrated, markComplete, progress, toggleComplete, visit],
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLearningProgress = () => useContext(Context)
