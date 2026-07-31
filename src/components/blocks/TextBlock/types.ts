import type { BookBlock } from '../../../models/book'
import {
  normalizeTypographyAlignment,
  type TypographyAlignment,
} from '../typography'

export const TEXT_BLOCK_TYPE = 'text' as const

export type TextAlignment = TypographyAlignment

export interface TextBlockContent {
  text: string
}

export interface TextBlockSettings {
  alignment: TextAlignment
  bold: boolean
  italic: boolean
  compact: boolean
}

export const DEFAULT_TEXT_SETTINGS: TextBlockSettings = {
  alignment: 'left',
  bold: false,
  italic: false,
  compact: false,
}

export function normalizeTextSettings(value: unknown): TextBlockSettings {
  const raw = (value ?? {}) as Partial<TextBlockSettings>

  return {
    alignment: normalizeTypographyAlignment(raw.alignment, DEFAULT_TEXT_SETTINGS.alignment),
    bold: typeof raw.bold === 'boolean' ? raw.bold : DEFAULT_TEXT_SETTINGS.bold,
    italic: typeof raw.italic === 'boolean' ? raw.italic : DEFAULT_TEXT_SETTINGS.italic,
    compact: typeof raw.compact === 'boolean' ? raw.compact : DEFAULT_TEXT_SETTINGS.compact,
  }
}

export interface TextBlockData extends BookBlock {
  type: typeof TEXT_BLOCK_TYPE
  content: TextBlockContent
  settings: TextBlockSettings
}
