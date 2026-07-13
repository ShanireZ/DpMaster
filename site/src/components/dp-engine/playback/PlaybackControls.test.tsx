import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlaybackControls } from './PlaybackControls.tsx'
import type { StepPlayer } from './types.ts'

function makePlayer(over: Partial<StepPlayer> = {}): StepPlayer {
  return {
    index: 0,
    count: 5,
    playing: false,
    speed: 1,
    canPrevious: false,
    canNext: true,
    canPlay: true,
    setIndex: vi.fn(),
    previous: vi.fn(),
    next: vi.fn(),
    reset: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    toggle: vi.fn(),
    setSpeed: vi.fn(),
    ...over,
  }
}

describe('<PlaybackControls>', () => {
  it('reflects player capability flags on the transport buttons', () => {
    // index 2 (not at start) so the reset button is enabled.
    const player = makePlayer({ index: 2, canPrevious: true, canNext: false, canPlay: false })
    render(<PlaybackControls player={player} />)

    expect(screen.getByRole('button', { name: '重置' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '上一步' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '播放' })).toBeDisabled()
  })

  it('disables the reset button at the start when paused', () => {
    const player = makePlayer({ index: 0, playing: false, canPrevious: false })
    render(<PlaybackControls player={player} />)
    expect(screen.getByRole('button', { name: '重置' })).toBeDisabled()
  })

  it('wires keyboard shortcuts to the player', () => {
    const player = makePlayer()
    render(<PlaybackControls player={player} />)
    const group = screen.getByRole('group', { name: '逐帧播放控制' })

    fireEvent.keyDown(group, { key: 'ArrowRight' })
    fireEvent.keyDown(group, { key: 'Home' })
    fireEvent.keyDown(group, { key: ' ' })

    expect(player.next).toHaveBeenCalledTimes(1)
    expect(player.reset).toHaveBeenCalledTimes(1)
    expect(player.toggle).toHaveBeenCalledTimes(1)
  })

  it('calls setSpeed when a speed is chosen', () => {
    const player = makePlayer({ speed: 1 })
    render(<PlaybackControls player={player} />)
    fireEvent.click(screen.getByRole('button', { name: '速度 2 倍' }))
    expect(player.setSpeed).toHaveBeenCalledWith(2)
  })

  it('marks the active speed with aria-pressed', () => {
    const player = makePlayer({ speed: 2 })
    render(<PlaybackControls player={player} />)
    expect(screen.getByRole('button', { name: '速度 2 倍' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '速度 1 倍' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clamps the progress slider to count - 1', () => {
    const player = makePlayer({ count: 5, index: 2 })
    render(<PlaybackControls player={player} />)
    const slider = screen.getByRole('slider', { name: '进度' }) as HTMLInputElement
    expect(slider.max).toBe('4')
    expect(slider.value).toBe('2')
  })
})
