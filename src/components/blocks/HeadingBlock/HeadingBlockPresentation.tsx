import type { ReactNode } from 'react'
import { normalizeHeadingSettings, type HeadingBlockSettings } from './types'

interface HeadingBlockPresentationProps {
  settings: HeadingBlockSettings | unknown
  children: ReactNode
}

function resolveHeadingTag(level: HeadingBlockSettings['level']): 'h1' | 'h2' | 'h3' {
  if (level === 1) {
    return 'h1'
  }

  if (level === 3) {
    return 'h3'
  }

  return 'h2'
}

function resolveHeadingClassName(settings: HeadingBlockSettings): string {
  return [
    'book-heading',
    `heading-align-${settings.alignment}`,
    settings.bold ? 'heading-bold' : 'heading-regular',
    settings.italic ? 'heading-italic' : 'heading-roman',
  ].join(' ')
}

export function HeadingBlockPresentation({ settings, children }: HeadingBlockPresentationProps) {
  const normalized = normalizeHeadingSettings(settings)
  const HeadingTag = resolveHeadingTag(normalized.level)

  return <HeadingTag className={resolveHeadingClassName(normalized)}>{children}</HeadingTag>
}