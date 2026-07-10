export interface Tone {
  frequency: number
  duration?: number
  type?: OscillatorType
}

let sharedContext: AudioContext | null = null

type AudioWindow = Window & {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

export function playGameTone(
  { frequency, duration = 0.08, type = 'triangle' }: Tone,
  muted = false,
): void {
  if (muted || typeof window === 'undefined') return

  const audioWindow = window as AudioWindow
  const AudioContextConstructor = audioWindow.AudioContext || audioWindow.webkitAudioContext
  if (!AudioContextConstructor) return

  try {
    const context = (sharedContext ??= new AudioContextConstructor())
    if (context.state === 'suspended') {
      void context.resume().catch(() => undefined)
    }

    const now = context.currentTime
    const length = Math.max(0.02, Math.min(duration, 1))
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(Math.max(40, frequency), now)
    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + length)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + length)
  } catch {
    // 音频不是游戏正确性边界；浏览器拒绝时静默降级。
  }
}
