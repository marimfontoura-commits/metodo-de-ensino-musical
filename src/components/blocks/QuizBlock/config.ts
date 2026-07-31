import { createId } from '../../../services/idService'
import {
  DEFAULT_QUIZ_SETTINGS,
  QUIZ_BLOCK_TYPE,
  type QuizBlockData,
  type QuizOption,
} from './types'

function createDefaultQuizOptions(): QuizOption[] {
  return [
    { id: createId('opt'), text: 'Alternativa A' },
    { id: createId('opt'), text: 'Alternativa B' },
    { id: createId('opt'), text: 'Alternativa C' },
  ]
}

export function createQuizBlock(): QuizBlockData {
  const options = createDefaultQuizOptions()

  return {
    id: createId('block'),
    type: QUIZ_BLOCK_TYPE,
    content: {
      question: 'Nova pergunta',
      questionImage: undefined,
      questionBlockId: undefined,
      options,
      correctOptionId: options[0].id,
      successFeedback: 'Resposta correta! Muito bem.',
      errorFeedback: 'Resposta incorreta. Tente novamente.',
    },
    settings: {
      ...DEFAULT_QUIZ_SETTINGS,
    },
  }
}