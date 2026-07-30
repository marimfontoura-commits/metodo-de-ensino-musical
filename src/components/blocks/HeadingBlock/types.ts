import type { BookBlock } from '../../../models/book'

export const HEADING_BLOCK_TYPE = 'heading' as const

export type HeadingLevel = 1 | 2 | 3
export type HeadingAlignment = 'left' | 'center' | 'right'

export interface HeadingBlockContent {
  text: string
}

export interface HeadingBlockSettings {
  level: HeadingLevel
  alignment: HeadingAlignment
  bold: boolean
  italic: boolean
}

export const DEFAULT_HEADING_SETTINGS: HeadingBlockSettings = {
  level: 2,
  alignment: 'left',
  bold: true,
  italic: false,
}

export function normalizeHeadingLevel(value: unknown): HeadingLevel {
  if (value === 1 || value === 2 || value === 3) {
    return value
  }

  return DEFAULT_HEADING_SETTINGS.level
}

export function normalizeHeadingAlignment(value: unknown): HeadingAlignment {
  if (value === 'left' || value === 'center' || value === 'right') {
    return value
  }

  return DEFAULT_HEADING_SETTINGS.alignment
}

export function normalizeHeadingSettings(value: unknown): HeadingBlockSettings {
  const raw = (value ?? {}) as Partial<HeadingBlockSettings>

  return {
    level: normalizeHeadingLevel(raw.level),
    alignment: normalizeHeadingAlignment(raw.alignment),
    bold: typeof raw.bold === 'boolean' ? raw.bold : DEFAULT_HEADING_SETTINGS.bold,
    italic: typeof raw.italic === 'boolean' ? raw.italic : DEFAULT_HEADING_SETTINGS.italic,
  }
}

export interface HeadingBlockData extends BookBlock {
  type: typeof HEADING_BLOCK_TYPE
  content: HeadingBlockContent
  settings: HeadingBlockSettings
}
