/**
 * Construction foley for Purpose Academy.
 * Procedural Web Audio — no large sample files. Short, site-real, never noisy.
 *
 * Design:
 * - Soft by default; mute remembered in localStorage
 * - No looping hammer spam — one-shots and quiet ambient beds
 * - Unlock AudioContext on first user gesture (Enter hammer / Sound on)
 * - Respects prefers-reduced-motion for ambient beds
 */

const MUTE_KEY = 'pa-foley-muted-v1'
const VOLUME_KEY = 'pa-foley-volume-v1'

type Cue =
  | 'hammer'
  | 'wood'
  | 'saw'
  | 'metal'
  | 'correct'
  | 'wrong'
  | 'latch'
  | 'ambient-start'
  | 'ambient-stop'
  | 'whoosh'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let ambientNodes: { stop: () => void } | null = null
let unlocked = false
let listeners = new Set<() => void>()

function reducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export function isFoleyMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function getFoleyVolume(): number {
  try {
    const n = Number(localStorage.getItem(VOLUME_KEY) ?? '0.45')
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.45
  } catch {
    return 0.45
  }
}

export function setFoleyMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    /* */
  }
  if (muted) stopAmbient()
  listeners.forEach((fn) => fn())
}

export function setFoleyVolume(v: number) {
  const clamped = Math.min(1, Math.max(0, v))
  try {
    localStorage.setItem(VOLUME_KEY, String(clamped))
  } catch {
    /* */
  }
  if (master) master.gain.value = clamped
  listeners.forEach((fn) => fn())
}

export function subscribeFoley(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!ctx) {
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = getFoleyVolume()
    master.connect(ctx.destination)
  }
  return ctx
}

/** Call from a click/tap so browsers allow sound. */
export async function unlockFoley(): Promise<void> {
  const c = ensureCtx()
  if (!c) return
  if (c.state === 'suspended') {
    try {
      await c.resume()
    } catch {
      /* */
    }
  }
  unlocked = true
}

export function isFoleyUnlocked() {
  return unlocked
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buf
}

function tone(
  c: AudioContext,
  dest: AudioNode,
  {
    freq,
    type = 'sine',
    start,
    dur,
    gain = 0.2,
    attack = 0.01,
    release = 0.08,
    slideTo,
  }: {
    freq: number
    type?: OscillatorType
    start: number
    dur: number
    gain?: number
    attack?: number
    release?: number
    slideTo?: number
  },
) {
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo != null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), start + dur)
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(gain, start + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(attack + 0.01, dur - release))
  osc.connect(g)
  g.connect(dest)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

function burstNoise(
  c: AudioContext,
  dest: AudioNode,
  { start, dur, gain = 0.15, filterFreq = 1200 }: { start: number; dur: number; gain?: number; filterFreq?: number },
) {
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, Math.max(0.05, dur + 0.05))
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = filterFreq
  filter.Q.value = 0.8
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(gain, start + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  src.connect(filter)
  filter.connect(g)
  g.connect(dest)
  src.start(start)
  src.stop(start + dur + 0.02)
}

function playHammer(c: AudioContext, dest: AudioNode, when = 0) {
  const t = c.currentTime + when
  // Strike transient
  burstNoise(c, dest, { start: t, dur: 0.045, gain: 0.22, filterFreq: 1800 })
  // Resonant wood/metal body
  tone(c, dest, { freq: 180, type: 'triangle', start: t, dur: 0.16, gain: 0.12, attack: 0.004, release: 0.1, slideTo: 90 })
  tone(c, dest, { freq: 520, type: 'sine', start: t + 0.01, dur: 0.08, gain: 0.05, attack: 0.002, release: 0.05 })
}

function playWood(c: AudioContext, dest: AudioNode, when = 0) {
  const t = c.currentTime + when
  burstNoise(c, dest, { start: t, dur: 0.06, gain: 0.14, filterFreq: 900 })
  tone(c, dest, { freq: 140, type: 'triangle', start: t, dur: 0.12, gain: 0.1, attack: 0.003, release: 0.08, slideTo: 70 })
}

function playSaw(c: AudioContext, dest: AudioNode, when = 0) {
  const t = c.currentTime + when
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, 0.45)
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(700, t)
  filter.frequency.linearRampToValueAtTime(1400, t + 0.25)
  filter.frequency.linearRampToValueAtTime(600, t + 0.4)
  filter.Q.value = 2.2
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.08, t + 0.05)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
  src.connect(filter)
  filter.connect(g)
  g.connect(dest)
  src.start(t)
  src.stop(t + 0.45)
}

function playMetal(c: AudioContext, dest: AudioNode, when = 0) {
  const t = c.currentTime + when
  tone(c, dest, { freq: 880, type: 'sine', start: t, dur: 0.35, gain: 0.07, attack: 0.002, release: 0.25, slideTo: 440 })
  tone(c, dest, { freq: 1320, type: 'triangle', start: t, dur: 0.22, gain: 0.04, attack: 0.002, release: 0.15 })
  burstNoise(c, dest, { start: t, dur: 0.03, gain: 0.08, filterFreq: 2400 })
}

function playCorrect(c: AudioContext, dest: AudioNode) {
  const t = c.currentTime
  // Soft wrench “ting”
  tone(c, dest, { freq: 660, type: 'sine', start: t, dur: 0.12, gain: 0.09, attack: 0.004, release: 0.08 })
  tone(c, dest, { freq: 990, type: 'sine', start: t + 0.08, dur: 0.18, gain: 0.07, attack: 0.004, release: 0.12 })
}

function playWrong(c: AudioContext, dest: AudioNode) {
  const t = c.currentTime
  burstNoise(c, dest, { start: t, dur: 0.08, gain: 0.1, filterFreq: 280 })
  tone(c, dest, { freq: 120, type: 'triangle', start: t, dur: 0.2, gain: 0.08, attack: 0.01, release: 0.12, slideTo: 60 })
}

function playLatch(c: AudioContext, dest: AudioNode) {
  const t = c.currentTime
  burstNoise(c, dest, { start: t, dur: 0.035, gain: 0.12, filterFreq: 1600 })
  tone(c, dest, { freq: 240, type: 'square', start: t + 0.02, dur: 0.06, gain: 0.04, attack: 0.002, release: 0.04 })
}

function playWhoosh(c: AudioContext, dest: AudioNode) {
  const t = c.currentTime
  burstNoise(c, dest, { start: t, dur: 0.22, gain: 0.07, filterFreq: 500 })
}

function startAmbient(c: AudioContext, dest: AudioNode) {
  stopAmbient()
  if (reducedMotion()) return

  const rumble = c.createOscillator()
  rumble.type = 'sine'
  rumble.frequency.value = 48
  const rumbleGain = c.createGain()
  rumbleGain.gain.value = 0.018
  rumble.connect(rumbleGain)
  rumbleGain.connect(dest)
  rumble.start()

  const air = c.createBufferSource()
  air.buffer = noiseBuffer(c, 2)
  air.loop = true
  const airFilter = c.createBiquadFilter()
  airFilter.type = 'lowpass'
  airFilter.frequency.value = 420
  const airGain = c.createGain()
  airGain.gain.value = 0.012
  air.connect(airFilter)
  airFilter.connect(airGain)
  airGain.connect(dest)
  air.start()

  // Occasional distant hammer — sparse, not spammy
  let alive = true
  const scheduleTap = () => {
    if (!alive || isFoleyMuted()) return
    playHammer(c, dest, 0.02)
    const next = 2800 + Math.random() * 4200
    window.setTimeout(scheduleTap, next)
  }
  const first = window.setTimeout(scheduleTap, 900 + Math.random() * 800)

  ambientNodes = {
    stop: () => {
      alive = false
      window.clearTimeout(first)
      try {
        rumble.stop()
        air.stop()
      } catch {
        /* */
      }
      rumble.disconnect()
      rumbleGain.disconnect()
      air.disconnect()
      airFilter.disconnect()
      airGain.disconnect()
    },
  }
}

export function stopAmbient() {
  if (ambientNodes) {
    ambientNodes.stop()
    ambientNodes = null
  }
}

/** Play a named construction cue. No-ops when muted or locked. */
export function playFoley(cue: Cue) {
  if (isFoleyMuted()) {
    if (cue === 'ambient-stop') stopAmbient()
    return
  }
  const c = ensureCtx()
  if (!c || !master || !unlocked) {
    if (cue === 'ambient-stop') stopAmbient()
    return
  }
  if (c.state === 'suspended') void c.resume()

  switch (cue) {
    case 'hammer':
      playHammer(c, master)
      break
    case 'wood':
      playWood(c, master)
      break
    case 'saw':
      playSaw(c, master)
      break
    case 'metal':
      playMetal(c, master)
      break
    case 'correct':
      playCorrect(c, master)
      break
    case 'wrong':
      playWrong(c, master)
      break
    case 'latch':
      playLatch(c, master)
      break
    case 'whoosh':
      playWhoosh(c, master)
      break
    case 'ambient-start':
      startAmbient(c, master)
      break
    case 'ambient-stop':
      stopAmbient()
      break
  }
}

/** Loading / crew bed: ambient + one soft hammer. */
export function beginCrewSoundscape() {
  void unlockFoley().then(() => {
    playFoley('ambient-start')
    playFoley('hammer')
  })
}

export function endCrewSoundscape() {
  playFoley('ambient-stop')
}
