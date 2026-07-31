import type { BookBlock } from '../../../models/book'
import type { ContentAlignment, ContentWidth } from '../../../models/layoutOptions'
import {
  normalizeImageSourceContent,
  type ImageSourceContent,
  type NormalizedImageSourceContent,
} from '../imageSource'

export const IMAGE_BLOCK_TYPE = 'image' as const

export interface ImageBlockContent extends ImageSourceContent {}

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

export function normalizeImageContent(content: ImageBlockContent): NormalizedImageSourceContent {
  return normalizeImageSourceContent(content)
}
