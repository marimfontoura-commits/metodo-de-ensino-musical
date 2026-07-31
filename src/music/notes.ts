const PITCH_CLASS_TO_SEMITONE: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

const SEMITONE_TO_PITCH_CLASS_SHARP = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

export interface ParsedNoteId {
  pitchClass: string
  octave: number
}

export function parseNoteId(value: string): ParsedNoteId | undefined {
  const match = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(value.trim())
  if (!match) {
    return undefined
  }

  const letter = match[1].toUpperCase()
  const accidental = match[2]
  const octave = Number.parseInt(match[3], 10)
  const rawPitchClass = `${letter}${accidental}`

  if (!Number.isInteger(octave) || !(rawPitchClass in PITCH_CLASS_TO_SEMITONE)) {
    return undefined
  }

  const semitone = PITCH_CLASS_TO_SEMITONE[rawPitchClass]
  return {
    pitchClass: SEMITONE_TO_PITCH_CLASS_SHARP[semitone],
    octave,
  }
}

export function noteIdToSemitoneIndex(value: string): number | undefined {
  const parsed = parseNoteId(value)
  if (!parsed) {
    return undefined
  }

  const semitone = PITCH_CLASS_TO_SEMITONE[parsed.pitchClass]
  return parsed.octave * 12 + semitone
}

export function semitoneIndexToNoteId(index: number): string {
  const octave = Math.floor(index / 12)
  const semitone = ((index % 12) + 12) % 12
  return `${SEMITONE_TO_PITCH_CLASS_SHARP[semitone]}${octave}`
}

export function normalizeNoteId(value: string, fallback = 'C3'): string {
  const semitoneIndex = noteIdToSemitoneIndex(value)
  if (typeof semitoneIndex !== 'number') {
    return fallback
  }

  return semitoneIndexToNoteId(semitoneIndex)
}

export function getPitchClass(value: string): string {
  const parsed = parseNoteId(value)
  return parsed?.pitchClass ?? 'C'
}

export function isBlackPitchClass(pitchClass: string): boolean {
  return pitchClass.includes('#')
}

export function isBlackNoteId(value: string): boolean {
  return isBlackPitchClass(getPitchClass(value))
}
