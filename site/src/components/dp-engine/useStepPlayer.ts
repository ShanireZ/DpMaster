import { useCallback, useEffect, useState } from 'react'

/** 逐帧播放控制：play/pause/单步/scrub/调速。 */
export function useStepPlayer(count: number) {
  const [index, setIndexRaw] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const clamp = useCallback((i: number) => Math.max(0, Math.min(count - 1, i)), [count])
  const setIndex = useCallback((i: number) => setIndexRaw(clamp(i)), [clamp])
  const next = useCallback(() => setIndexRaw((i) => clamp(i + 1)), [clamp])
  const prev = useCallback(() => setIndexRaw((i) => clamp(i - 1)), [clamp])
  const reset = useCallback(() => {
    setPlaying(false)
    setIndexRaw(0)
  }, [])
  const pause = useCallback(() => setPlaying(false), [])
  const play = useCallback(() => {
    setIndexRaw((i) => (i >= count - 1 ? 0 : i))
    setPlaying(true)
  }, [count])
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play])

  // 播放推进
  useEffect(() => {
    if (!playing) return
    if (index >= count - 1) {
      setPlaying(false)
      return
    }
    const id = setTimeout(() => setIndexRaw((i) => clamp(i + 1)), 640 / speed)
    return () => clearTimeout(id)
  }, [playing, index, count, speed, clamp])

  // count 变化（换输入）时，钳制 index
  useEffect(() => {
    setIndexRaw((i) => Math.max(0, Math.min(count - 1, i)))
  }, [count])

  return { index, setIndex, playing, play, pause, toggle, next, prev, reset, speed, setSpeed, count }
}
