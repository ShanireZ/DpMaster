import type { PlaybackSpeed } from './state'

export interface StepPlayer {
  index: number
  count: number
  playing: boolean
  speed: PlaybackSpeed
  canPrevious: boolean
  canNext: boolean
  canPlay: boolean
  setIndex(index: number): void
  previous(): void
  next(): void
  reset(): void
  play(): void
  pause(): void
  toggle(): void
  setSpeed(speed: PlaybackSpeed): void
}
