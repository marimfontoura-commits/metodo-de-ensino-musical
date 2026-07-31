export type TypographyAlignment = 'left' | 'center' | 'right' | 'justify'

export interface TypographySettings {
  alignment: TypographyAlignment
  bold: boolean
  italic: boolean
}

export function normalizeTypographyAlignment(
  value: unknown,
  fallback: TypographyAlignment,
): TypographyAlignment {
  if (value === 'left' || value === 'center' || value === 'right' || value === 'justify') {
    return value
  }

  return fallback
}

export function resolveTypographyClassName(settings: TypographySettings): string {
  return [
    `typography-align-${settings.alignment}`,
    settings.bold ? 'typography-bold' : 'typography-regular',
    settings.italic ? 'typography-italic' : 'typography-roman',
  ].join(' ')
}