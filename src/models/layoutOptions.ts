export type ContentWidth = 'small' | 'medium' | 'large' | 'full'
export type ContentAlignment = 'left' | 'center' | 'right'

export interface WidthOption {
  value: ContentWidth
  label: string
}

export interface AlignmentOption {
  value: ContentAlignment
  label: string
}

export const CONTENT_WIDTH_OPTIONS: WidthOption[] = [
  { value: 'small', label: 'Pequena' },
  { value: 'medium', label: 'Media' },
  { value: 'large', label: 'Grande' },
  { value: 'full', label: 'Total' },
]

export const CONTENT_ALIGNMENT_OPTIONS: AlignmentOption[] = [
  { value: 'left', label: 'Esquerda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Direita' },
]

export const DEFAULT_CONTENT_WIDTH: ContentWidth = 'medium'
export const DEFAULT_CONTENT_ALIGNMENT: ContentAlignment = 'center'
