import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clampPlaybackIndex,
  nextPlaybackIndex,
  normalizePlaybackSpeed,
  previousPlaybackIndex,
} from './state'
import type { PlaybackSpeed } from './state'
import type { StepPlayer } from './types'

/** 逐帧教学播放：统一单步、进度、调速、结尾重播与输入变更处理。 */
export function useStepPlayer(count: number): StepPlayer {
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0
  const hasFrames = count > 0
  const [index, setIndexRaw] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeedRaw] = useState<PlaybackSpeed>(1)

  const setIndex = useCallback(
    (nextIndex: number) => setIndexRaw(clampPlaybackIndex(nextIndex, safeCount)),
    [safeCount],
  )
  const pause = useCallback(() => setPlaying(false), [])
  const previous = useCallback(() => {
    setPlaying(false)
    setIndexRaw((current) => previousPlaybackIndex(current, safeCount))
  }, [safeCount])
  const next = useCallback(() => {
    setPlaying(false)
    setIndexRaw((current) => nextPlaybackIndex(current, safeCount))
  }, [safeCount])
  const reset = useCallback(() => {
    setPlaying(false)
    setIndexRaw(0)
  }, [])
  const play = useCallback(() => {
    if (safeCount <= 1) {
      setPlaying(false)
      return
    }
    setIndexRaw((current) => (current >= safeCount - 1 ? 0 : current))
    setPlaying(true)
  }, [safeCount])
  const toggle = useCallback(() => {
    if (playing) pause()
    else play()
  }, [pause, play, playing])
  const setSpeed = useCallback((nextSpeed: PlaybackSpeed) => {
    setSpeedRaw(normalizePlaybackSpeed(nextSpeed))
  }, [])

  useEffect(() => {
    if (!playing) return
    if (index >= safeCount - 1 || safeCount <= 1) {
      setPlaying(false)
      return
    }
    const timer = window.setTimeout(() => {
      setIndexRaw((current) => nextPlaybackIndex(current, safeCount))
    }, 640 / speed)
    return () => window.clearTimeout(timer)
  }, [index, playing, safeCount, speed])

  // 更换输入/帧轨时暂停，并把焦点帧拉回有效范围。
  useEffect(() => {
    setPlaying(false)
    setIndexRaw((current) => clampPlaybackIndex(current, safeCount))
  }, [safeCount])

  return useMemo(
    () => ({
      index,
      count: safeCount,
      playing,
      speed,
      canPrevious: hasFrames && index > 0,
      canNext: hasFrames && index < safeCount - 1,
      canPlay: safeCount > 1,
      setIndex,
      previous,
      next,
      reset,
      play,
      pause,
      toggle,
      setSpeed,
    }),
    [hasFrames, index, next, pause, play, playing, previous, reset, safeCount, setIndex, setSpeed, speed, toggle],
  )
}
