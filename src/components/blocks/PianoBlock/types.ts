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
export type PianoLearnerRole = 'stimulus' | 'response' | 'support'
export type PianoInteractionMode = 'static' | 'explore' | 'select-notes'
export type PianoComparisonMode = 'exact'

export interface PianoLearnerAnswer {
  selectedNoteIds: string[]
}

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
  settings: PianoBlockSettings
}

export interface PianoBlockSettings {
  learnerRole?: PianoLearnerRole
  interactionMode?: PianoInteractionMode
  minSelections?: number
  maxSelections?: number | null
  expectedNoteIds?: string[]
  comparisonMode?: PianoComparisonMode
}

export interface NormalizedPianoBlockSettings {
  learnerRole: PianoLearnerRole
  interactionMode: PianoInteractionMode
  minSelections: number
  maxSelections: number | null
  expectedNoteIds: string[]
  comparisonMode: PianoComparisonMode
}

export const DEFAULT_PIANO_CONTENT: NormalizedPianoBlockContent = {
  mode: 'display',
  firstNote: 'C3',
  octaveCount: 2,
  highlightedNoteIds: [],
  showNoteNames: true,
}

export const DEFAULT_PIANO_SETTINGS: NormalizedPianoBlockSettings = {
  learnerRole: 'stimulus',
  interactionMode: 'static',
  minSelections: 0,
  maxSelections: null,
  expectedNoteIds: [],
  comparisonMode: 'exact',
}

function normalizeSelectionLimit(value: unknown, fallback: number): number {
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : fallback
}

export function normalizePianoSettings(value: unknown): NormalizedPianoBlockSettings {
  const raw = (value ?? {}) as Partial<PianoBlockSettings>
  const validPair =
    (raw.learnerRole === 'stimulus' && raw.interactionMode === 'static') ||
    (raw.learnerRole === 'support' && raw.interactionMode === 'explore') ||
    (raw.learnerRole === 'response' && raw.interactionMode === 'select-notes')
  const learnerRole = validPair ? raw.learnerRole! : DEFAULT_PIANO_SETTINGS.learnerRole
  const interactionMode = validPair ? raw.interactionMode! : DEFAULT_PIANO_SETTINGS.interactionMode
  const minSelections = normalizeSelectionLimit(raw.minSelections, DEFAULT_PIANO_SETTINGS.minSelections)
  const rawMax = (raw as { maxSelections?: unknown }).maxSelections
  const maxSelections = rawMax === null || rawMax === undefined || rawMax === ''
    ? null
    : Math.max(minSelections, normalizeSelectionLimit(rawMax, minSelections))
  const expectedNoteIds = Array.isArray(raw.expectedNoteIds)
    ? raw.expectedNoteIds.filter((item): item is string => typeof item === 'string')
    : []

  return {
    learnerRole,
    interactionMode,
    minSelections,
    maxSelections,
    expectedNoteIds: Array.from(new Set(expectedNoteIds)),
    comparisonMode: raw.comparisonMode === 'exact' ? 'exact' : DEFAULT_PIANO_SETTINGS.comparisonMode,
  }
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
