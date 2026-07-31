export const ROOT_DROP_ZONE_ID = 'root-drop-zone'

export type QuizDropTarget =
  | {
      kind: 'question'
      quizBlockId: string
    }
  | {
      kind: 'option'
      quizBlockId: string
      optionId: string
    }

const QUIZ_SLOT_PREFIX = 'quiz-slot:'

export function createQuestionSlotDropId(quizBlockId: string): string {
  return `${QUIZ_SLOT_PREFIX}${quizBlockId}:question`
}

export function createOptionSlotDropId(quizBlockId: string, optionId: string): string {
  return `${QUIZ_SLOT_PREFIX}${quizBlockId}:option:${optionId}`
}

export function parseQuizDropTarget(dropId: string): QuizDropTarget | undefined {
  if (!dropId.startsWith(QUIZ_SLOT_PREFIX)) {
    return undefined
  }

  const payload = dropId.slice(QUIZ_SLOT_PREFIX.length)
  const parts = payload.split(':')

  if (parts.length === 2 && parts[1] === 'question') {
    return {
      kind: 'question',
      quizBlockId: parts[0],
    }
  }

  if (parts.length === 3 && parts[1] === 'option' && parts[2]) {
    return {
      kind: 'option',
      quizBlockId: parts[0],
      optionId: parts[2],
    }
  }

  return undefined
}
