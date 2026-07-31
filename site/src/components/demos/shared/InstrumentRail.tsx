import { useId, useState, type ReactNode } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { PlaybackControls } from '../../dp-engine/playback/PlaybackControls.tsx'
import type { StepPlayer } from '../../dp-engine/playback/types.ts'

export interface InstrumentRailProps {
  player: StepPlayer
  label?: string
  secondaryLabel?: string
  secondary?: ReactNode
  defaultSecondaryOpen?: boolean
  className?: string
}

export function InstrumentRail({
  player,
  label = '算法演示工具轨道',
  secondaryLabel = '参数与模式',
  secondary,
  defaultSecondaryOpen = false,
  className = '',
}: InstrumentRailProps) {
  const [secondaryOpen, setSecondaryOpen] = useState(defaultSecondaryOpen)
  const secondaryId = useId()

  return (
    <div className={`instrument-rail${className ? ` ${className}` : ''}`} aria-label={label}>
      <div className="instrument-rail__primary">
        <PlaybackControls player={player} label={label} />
        {secondary && (
          <button
            type="button"
            className="instrument-rail__secondary-toggle"
            aria-expanded={secondaryOpen}
            aria-controls={secondaryId}
            onClick={() => setSecondaryOpen((open) => !open)}
          >
            <SlidersHorizontal size={17} aria-hidden="true" />
            <span>{secondaryLabel}</span>
          </button>
        )}
      </div>
      {secondary && (
        <div
          id={secondaryId}
          className="instrument-rail__secondary"
          data-open={secondaryOpen ? 'true' : 'false'}
          hidden={!secondaryOpen}
        >
          {secondary}
        </div>
      )}
    </div>
  )
}
