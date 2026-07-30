import type { BookBlock } from '../../../models/book'

export const TEXT_BLOCK_TYPE = 'text' as const

export interface TextBlockContent {
  text: string
}

export interface TextBlockSettings {
  compact: boolean
}

export interface TextBlockData extends BookBlock {
  type: typeof TEXT_BLOCK_TYPE
  content: TextBlockContent
  settings: TextBlockSettings
}
