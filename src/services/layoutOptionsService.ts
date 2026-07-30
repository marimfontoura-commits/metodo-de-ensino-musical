import {
  DEFAULT_CONTENT_ALIGNMENT,
  DEFAULT_CONTENT_WIDTH,
  type ContentAlignment,
  type ContentWidth,
} from '../models/layoutOptions'

export interface LayoutOptionsSettings {
  width: ContentWidth
  alignment: ContentAlignment
}

export function normalizeContentWidth(value: unknown): ContentWidth {
  if (value === 'small' || value === 'medium' || value === 'large' || value === 'full') {
    return value
  }

  return DEFAULT_CONTENT_WIDTH
}

export function normalizeContentAlignment(value: unknown): ContentAlignment {
  if (value === 'left' || value === 'center' || value === 'right') {
    return value
  }

  return DEFAULT_CONTENT_ALIGNMENT
}

export function toWidthClass(value: ContentWidth): string {
  if (value === 'small') {
    return 'content-width-small'
  }

  if (value === 'large') {
    return 'content-width-large'
  }

  if (value === 'full') {
    return 'content-width-full'
  }

  return 'content-width-medium'
}

export function toAlignmentClass(value: ContentAlignment): string {
  if (value === 'left') {
    return 'content-align-left'
  }

  if (value === 'right') {
    return 'content-align-right'
  }

  return 'content-align-center'
}
