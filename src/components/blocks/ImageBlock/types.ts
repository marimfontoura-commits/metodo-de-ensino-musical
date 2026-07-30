import type { BookBlock } from '../../../models/book'
import type { ContentAlignment, ContentWidth } from '../../../models/layoutOptions'

export const IMAGE_BLOCK_TYPE = 'image' as const

export interface ImageBlockContent {
  url: string
  alt: string
}

export interface ImageBlockSettings {
  rounded: boolean
  width: ContentWidth
  alignment: ContentAlignment
}

export interface ImageBlockData extends BookBlock {
  type: typeof IMAGE_BLOCK_TYPE
  content: ImageBlockContent
  settings: ImageBlockSettings
}
