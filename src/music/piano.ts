import {
  getPitchClass,
  isBlackPitchClass,
  normalizeNoteId,
  noteIdToSemitoneIndex,
  parseNoteId,
  semitoneIndexToNoteId,
} from './notes'

export const PIANO_FIRST_NOTE_OPTIONS = ['C2', 'C3', 'C4'] as const

export type PianoFirstNote = (typeof PIANO_FIRST_NOTE_OPTIONS)[number]

export interface PianoKeyModel {
  noteId: string
  pitchClass: string
  octave: number
  isBlack: boolean
  whiteIndex: number
  blackLeftPercent: number | null
}

export interface PianoKeyboardModel {
  keys: PianoKeyModel[]
  totalWhites: number
}

const MIN_OCTAVES = 1
const MAX_OCTAVES = 3

function isSupportedFirstNote(value: string): value is PianoFirstNote {
  return (PIANO_FIRST_NOTE_OPTIONS as readonly string[]).includes(value)
}

export function normalizePianoFirstNote(value: unknown, fallback: PianoFirstNote = 'C3'): PianoFirstNote {
  if (typeof value !== 'string') {
    return fallback
  }

  const normalized = normalizeNoteId(value, fallback)
  return isSupportedFirstNote(normalized) ? normalized : fallback
}

export function clampPianoOctaveCount(value: unknown, fallback = 2): number {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) {
    return fallback
  }

  const rounded = Math.round(numeric)
  if (rounded < MIN_OCTAVES) {
    return MIN_OCTAVES
  }

  if (rounded > MAX_OCTAVES) {
    return MAX_OCTAVES
  }

  return rounded
}

export function generatePianoKeyboard(startNote: string, octaveCount: number): PianoKeyboardModel {
  const normalizedStart = normalizePianoFirstNote(startNote)
  const normalizedOctaves = clampPianoOctaveCount(octaveCount)
  const startSemitone = noteIdToSemitoneIndex(normalizedStart)

  if (typeof startSemitone !== 'number') {
    return { keys: [], totalWhites: 0 }
  }

  const keyCount = normalizedOctaves * 12
  let whiteCount = 0
  const keys: PianoKeyModel[] = []

  for (let offset = 0; offset < keyCount; offset += 1) {
    const semitoneIndex = startSemitone + offset
    const noteId = semitoneIndexToNoteId(semitoneIndex)
    const parsed = parseNoteId(noteId)
    if (!parsed) {
      continue
    }

    const pitchClass = getPitchClass(noteId)
    const isBlack = isBlackPitchClass(pitchClass)

    if (!isBlack) {
      const whiteIndex = whiteCount
      whiteCount += 1
      keys.push({
        noteId,
        pitchClass,
        octave: parsed.octave,
        isBlack: false,
        whiteIndex,
        blackLeftPercent: null,
      })
      continue
    }

    const anchorWhiteIndex = Math.max(whiteCount - 1, 0)
    keys.push({
      noteId,
      pitchClass,
      octave: parsed.octave,
      isBlack: true,
      whiteIndex: anchorWhiteIndex,
      blackLeftPercent: 0,
    })
  }

  const totalWhites = Math.max(whiteCount, 1)

  const withBlackPositions = keys.map((key) => {
    if (!key.isBlack) {
      return key
    }

    const leftPercent = ((key.whiteIndex + 1) / totalWhites) * 100
    return {
      ...key,
      blackLeftPercent: leftPercent,
    }
  })

  return {
    keys: withBlackPositions,
    totalWhites,
  }
}
