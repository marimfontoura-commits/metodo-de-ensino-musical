import {
  DEFAULT_HEADING_SETTINGS,
  HEADING_BLOCK_TYPE,
  type HeadingBlockData,
} from './types'
import { createId } from '../../../services/idService'

export function createHeadingBlock(): HeadingBlockData {
  return {
    id: createId('block'),
    type: HEADING_BLOCK_TYPE,
    content: {
      text: 'Novo titulo',
    },
    settings: { ...DEFAULT_HEADING_SETTINGS },
  }
}
