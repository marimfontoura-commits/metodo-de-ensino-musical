import type { Book, BookBlock } from '../models/book'
import type { BlockType } from '../models/book'
import { createId } from './idService'
import { createBlockByType } from '../components/blocks/registry'

export function createInitialBook(): Book {
  return {
    id: createId('book'),
    title: 'Livro sem titulo',
    blocks: [],
  }
}

export function createNewBlock(type: BlockType): BookBlock {
  return createBlockByType(type)
}

export function duplicateBlock(block: BookBlock): BookBlock {
  return {
    ...structuredClone(block),
    id: createId('block'),
  }
}
