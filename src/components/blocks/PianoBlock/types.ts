import type { BookBlock } from '../../../models/book'
import {
  clampPianoOctaveCount,
  generatePianoKeyboard,
  normalizePianoFirstNote,
  type PianoFirstNote,
} from '../../../music/piano'
import { normalizeNoteId } from '../../../music/notes'

export const PIANO_BLOCK_TYPE = 'piano' as const

export type PianoMode = 'display'

export interface PianoBlockContent {
  mode: PianoMode
  firstNote: PianoFirstNote
  octaveCount: number
  highlightedNoteIds: string[]
  showNoteNames: boolean
}

export interface NormalizedPianoBlockContent {
  mode: PianoMode
  firstNote: PianoFirstNote
  octaveCount: number
  highlightedNoteIds: string[]
  showNoteNames: boolean
}

export interface PianoBlockData extends BookBlock {
  type: typeof PIANO_BLOCK_TYPE
  content: PianoBlockContent
  settings: Record<string, never>
}

export const DEFAULT_PIANO_CONTENT: NormalizedPianoBlockContent = {
  mode: 'display',
  firstNote: 'C3',
  octaveCount: 2,
  highlightedNoteIds: [],
  showNoteNames: true,
}

export function normalizePianoContent(value: unknown): NormalizedPianoBlockContent {
  const raw = (value ?? {}) as Partial<PianoBlockContent>
  const mode: PianoMode = raw.mode === 'display' ? 'display' : 'display'
  const firstNote = normalizePianoFirstNote(raw.firstNote, DEFAULT_PIANO_CONTENT.firstNote)
  const octaveCount = clampPianoOctaveCount(raw.octaveCount, DEFAULT_PIANO_CONTENT.octaveCount)
  const keyboard = generatePianoKeyboard(firstNote, octaveCount)
  const validNotes = new Set(keyboard.keys.map((key) => key.noteId))

  const highlightedRaw = Array.isArray(raw.highlightedNoteIds)
    ? raw.highlightedNoteIds.filter((item): item is string => typeof item === 'string')
    : []

  const highlightedNoteIds = Array.from(
    new Set(
      highlightedRaw
        .map((noteId) => normalizeNoteId(noteId))
        .filter((noteId) => validNotes.has(noteId)),
    ),
  )

  return {
    mode,
    firstNote,
    octaveCount,
    highlightedNoteIds,
    showNoteNames: typeof raw.showNoteNames === 'boolean' ? raw.showNoteNames : DEFAULT_PIANO_CONTENT.showNoteNames,
  }
}
