import type { KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import type { PlaybackSpeed } from './state'
import type { StepPlayer } from './types'
import './playback.css'

const SPEEDS: readonly PlaybackSpeed[] = [0.5, 1, 2]

export interface PlaybackControlsProps {
  player: StepPlayer
  variant?: 'full' | 'compact'
  label?: string
  className?: string
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export function PlaybackControls({
  player,
  variant = 'full',
  label = '逐帧播放控制',
  className = '',
}: PlaybackControlsProps) {
  const current = player.count === 0 ? 0 : player.index + 1
  const status = `${player.playing ? '播放中' : '已暂停'}，第 ${current} 步，共 ${player.count} 步，${player.speed} 倍速`

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isEditableTarget(event.target)) return
    if (event.target instanceof HTMLButtonElement && (event.key === ' ' || event.key === 'Enter')) return

    if (event.key === 'Home') {
      event.preventDefault()
      player.reset()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      player.previous()
    } else if (event.key === ' ') {
      event.preventDefault()
      player.toggle()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      player.next()
    }
  }

  return (
    <div
      className={`playback playback--${variant}${className ? ` ${className}` : ''}`}
      role="group"
      aria-label={label}
      aria-keyshortcuts="Home ArrowLeft Space ArrowRight"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="playback__transport">
        <button
          type="button"
          onClick={player.reset}
          disabled={player.index === 0 && !player.playing}
          aria-label="重置"
          title="重置（Home）"
        >
          <RotateCcw size={variant === 'compact' ? 16 : 18} />
        </button>
        <button
          type="button"
          onClick={player.previous}
          disabled={!player.canPrevious}
          aria-label="上一步"
          title="上一步（←）"
        >
          <ChevronLeft size={variant === 'compact' ? 18 : 20} />
        </button>
        <button
          type="button"
          className="playback__primary"
          onClick={player.toggle}
          disabled={!player.canPlay}
          aria-label={player.playing ? '暂停' : '播放'}
          title={`${player.playing ? '暂停' : '播放'}（空格）`}
        >
          {player.playing ? (
            <Pause size={variant === 'compact' ? 17 : 20} />
          ) : (
            <Play size={variant === 'compact' ? 17 : 20} />
          )}
          {variant === 'full' && <span>{player.playing ? '暂停' : '播放'}</span>}
        </button>
        <button
          type="button"
          onClick={player.next}
          disabled={!player.canNext}
          aria-label="下一步"
          title="下一步（→）"
        >
          <ChevronRight size={variant === 'compact' ? 18 : 20} />
        </button>
      </div>

      <label className="playback__progress">
        <span className="playback__sr">进度</span>
        <input
          type="range"
          min={0}
          max={Math.max(0, player.count - 1)}
          value={player.index}
          disabled={player.count <= 1}
          onChange={(event) => {
            player.pause()
            player.setIndex(Number(event.target.value))
          }}
          aria-label="进度"
          aria-valuetext={`第 ${current} 步，共 ${player.count} 步`}
        />
        <span className="playback__count" aria-hidden="true">
          {current}/{player.count}
        </span>
      </label>

      <div className="playback__speed" role="group" aria-label="速度">
        {SPEEDS.map((speed) => (
          <button
            type="button"
            key={speed}
            className={player.speed === speed ? 'is-active' : ''}
            aria-pressed={player.speed === speed}
            aria-label={`速度 ${speed} 倍`}
            onClick={() => player.setSpeed(speed)}
          >
            {speed}×
          </button>
        ))}
      </div>

      <span className="playback__sr" aria-live="polite">
        {status}
      </span>
    </div>
  )
}
