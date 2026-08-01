import type { InteractiveResponseResult, InteractiveResponseStatus } from '../types'
import type { BookBlock } from '../../../models/book'
import {
  PIANO_BLOCK_TYPE,
  normalizePianoSettings,
  type NormalizedPianoBlockSettings,
  type PianoLearnerAnswer,
} from './types'

export function isPianoInteractiveResponseValid(block: BookBlock): boolean {
  if (block.type !== PIANO_BLOCK_TYPE) {
    return false
  }

  const settings = normalizePianoSettings(block.settings)
  return settings.learnerRole === 'response' && settings.interactionMode === 'select-notes'
}

function uniqueNoteIds(noteIds: string[]): Set<string> {
  return new Set(noteIds)
}

export function getPianoInteractiveResponseStatus(
  settings: NormalizedPianoBlockSettings,
  answer: PianoLearnerAnswer,
): InteractiveResponseStatus {
  if (settings.expectedNoteIds.length === 0) {
    return {
      isComplete: false,
      canSubmit: false,
      message: 'Esta questão ainda não possui resposta esperada configurada.',
    }
  }

  const selectionCount = uniqueNoteIds(answer.selectedNoteIds).size
  if (selectionCount < settings.minSelections) {
    return {
      isComplete: false,
      canSubmit: false,
      message: `Selecione pelo menos ${settings.minSelections} nota(s).`,
    }
  }

  if (settings.maxSelections !== null && selectionCount > settings.maxSelections) {
    return {
      isComplete: false,
      canSubmit: false,
      message: `Selecione no máximo ${settings.maxSelections} nota(s).`,
    }
  }

  return { isComplete: true, canSubmit: true }
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
