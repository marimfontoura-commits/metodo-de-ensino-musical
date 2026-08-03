import { createId } from '../../../services/idService'
import { DEFAULT_PIANO_CONTENT, DEFAULT_PIANO_SETTINGS, PIANO_BLOCK_TYPE, type PianoBlockData } from './types'

export function createPianoBlock(): PianoBlockData {
  return {
    id: createId('block'),
    type: PIANO_BLOCK_TYPE,
    content: {
      ...DEFAULT_PIANO_CONTENT,
    },
    settings: {
      ...DEFAULT_PIANO_SETTINGS,
    },
  }
}
