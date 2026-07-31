import type { ReactNode } from 'react'
import { resolveTypographyClassName } from '../typography'
import { normalizeTextSettings, type TextBlockSettings } from './types'

interface TextBlockPresentation {
  typographyClassName: string
  containerClassName: string
}

interface TextBlockPresentationProps {
  settings: TextBlockSettings | unknown
  children: ReactNode
}

export function resolveTextPresentation(settings: TextBlockSettings | unknown): TextBlockPresentation {
  const normalized = normalizeTextSettings(settings)
  const typographyClassName = resolveTypographyClassName(normalized)

  return {
    typographyClassName,
    containerClassName: `book-text ${typographyClassName}`,
  }
}

export function TextBlockPresentation({ settings, children }: TextBlockPresentationProps) {
  const presentation = resolveTextPresentation(settings)

  return <p className={presentation.containerClassName}>{children}</p>
}