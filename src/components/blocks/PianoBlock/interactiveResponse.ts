import type {
  InteractiveExpectedAnswerState,
  InteractiveResourceReadiness,
  InteractiveResponseResult,
  InteractiveResponseStatus,
} from '../music'
import type { BookBlock } from '../../../models/book'
import { generatePianoKeyboard } from '../../../music/piano'
import { normalizeNoteId } from '../../../music/notes'
import {
  PIANO_BLOCK_TYPE,
  getPianoLearnerInteraction,
  normalizePianoContent,
  normalizePianoSettings,
  type NormalizedPianoBlockSettings,
  type PianoLearnerAnswer,
} from './types'

export function isPianoInteractiveResponseValid(block: BookBlock): boolean {
  if (block.type !== PIANO_BLOCK_TYPE) {
    return false
  }

  return getPianoLearnerInteraction(block.settings) === 'interactive-response'
}

function uniqueNoteIds(noteIds: string[]): Set<string> {
  return new Set(noteIds)
}

function getSelectionLimitIssues(block: BookBlock): string[] {
  const raw = (block.settings ?? {}) as { minSelections?: unknown; maxSelections?: unknown }
  const issues: string[] = []
  const rawMin = raw.minSelections
  const rawMax = raw.maxSelections
  const parsedMin = rawMin === undefined ? 0 : Number(rawMin)
  const parsedMax = rawMax === undefined || rawMax === null || rawMax === '' ? null : Number(rawMax)

  if (!Number.isFinite(parsedMin) || parsedMin < 0 || !Number.isInteger(parsedMin)) {
    issues.push('O limite mínimo de seleções é inválido.')
  }

  if (parsedMax !== null && (!Number.isFinite(parsedMax) || parsedMax < 0 || !Number.isInteger(parsedMax))) {
    issues.push('O limite máximo de seleções é inválido.')
  } else if (parsedMax !== null && Number.isFinite(parsedMin) && parsedMax < parsedMin) {
    issues.push('O limite máximo deve ser maior ou igual ao mínimo.')
  }

  return issues
}

export function getPianoInteractiveResponseStatus(
  settings: NormalizedPianoBlockSettings,
  answer: PianoLearnerAnswer,
): InteractiveResponseStatus {
  const selectionCount = uniqueNoteIds(answer.selectedNoteIds).size
  const hasResponse = selectionCount > 0

  if (settings.expectedNoteIds.length === 0) {
    return {
      hasResponse,
      isComplete: false,
      canSubmit: false,
      message: 'Esta questão ainda não possui resposta esperada configurada.',
    }
  }

  if (selectionCount < settings.minSelections) {
    return {
      hasResponse,
      isComplete: false,
      canSubmit: false,
      message: `Selecione pelo menos ${settings.minSelections} nota(s).`,
    }
  }

  if (settings.maxSelections !== null && selectionCount > settings.maxSelections) {
    return {
      hasResponse,
      isComplete: false,
      canSubmit: false,
      message: `Selecione no máximo ${settings.maxSelections} nota(s).`,
    }
  }

  return { hasResponse, isComplete: true, canSubmit: true }
}

export function getPianoExpectedAnswerState(block: BookBlock): InteractiveExpectedAnswerState {
  if (block.type !== PIANO_BLOCK_TYPE) {
    return {
      hasExpectedAnswer: false,
      isValid: false,
      issues: ['O bloco não é um Piano.'],
    }
  }

  const content = normalizePianoContent(block.content)
  const settings = normalizePianoSettings(block.settings)
  const expected = uniqueNoteIds(settings.expectedNoteIds)
  const validNoteIds = new Set(
    generatePianoKeyboard(content.firstNote, content.octaveCount).keys.map((key) => key.noteId),
  )
  const invalidNoteIds = Array.from(expected).filter(
    (noteId) => !validNoteIds.has(normalizeNoteId(noteId)),
  )
  const issues: string[] = []

  if (expected.size === 0) {
    issues.push('A resposta esperada não foi definida.')
  }

  if (invalidNoteIds.length > 0) {
    issues.push('A resposta esperada contém notas fora do teclado configurado.')
  }

  if (expected.size < settings.minSelections) {
    issues.push('A resposta esperada possui menos notas que o mínimo permitido.')
  }

  if (settings.maxSelections !== null && expected.size > settings.maxSelections) {
    issues.push('A resposta esperada possui mais notas que o máximo permitido.')
  }

  return {
    hasExpectedAnswer: expected.size > 0,
    isValid: issues.length === 0,
    issues,
  }
}

export function getPianoInteractiveResourceReadiness(block: BookBlock): InteractiveResourceReadiness {
  if (block.type !== PIANO_BLOCK_TYPE) {
    return { isReady: false, issues: ['O bloco não é um Piano.'] }
  }

  const issues: string[] = []

  if (getPianoLearnerInteraction(block.settings) !== 'interactive-response') {
    issues.push('O Piano não está configurado como resposta interativa.')
  }

  issues.push(...getSelectionLimitIssues(block))
  issues.push(...getPianoExpectedAnswerState(block).issues)

  return { isReady: issues.length === 0, issues: Array.from(new Set(issues)) }
}

export function evaluatePianoInteractiveResponse(
  settings: NormalizedPianoBlockSettings,
  answer: PianoLearnerAnswer,
): InteractiveResponseResult {
  const status = getPianoInteractiveResponseStatus(settings, answer)
  const expected = uniqueNoteIds(settings.expectedNoteIds)
  const selected = uniqueNoteIds(answer.selectedNoteIds)
  const missingCount = Array.from(expected).filter((noteId) => !selected.has(noteId)).length
  const extraCount = Array.from(selected).filter((noteId) => !expected.has(noteId)).length

  return {
    isComplete: status.isComplete,
    isCorrect: status.isComplete && missingCount === 0 && extraCount === 0 && expected.size === selected.size,
    missingCount,
    extraCount,
  }
}
