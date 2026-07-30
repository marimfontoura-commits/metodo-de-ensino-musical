import { TEXT_BLOCK_TYPE, type TextBlockData } from './types'
import { createId } from '../../../services/idService'

export function createTextBlock(): TextBlockData {
  return {
    id: createId('block'),
    type: TEXT_BLOCK_TYPE,
    content: {
      text: 'Novo paragrafo',
    },
    settings: {
      compact: false,
    },
  }
}
