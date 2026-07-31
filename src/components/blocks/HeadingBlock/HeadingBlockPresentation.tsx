import type { ReactNode } from 'react'
import { normalizeHeadingSettings, type HeadingBlockSettings } from './types'
import { resolveTypographyClassName } from '../typography'

interface HeadingPresentation {
  tag: 'h1' | 'h2' | 'h3'
  typographyClassName: string
  containerClassName: string
}

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
  return resolveTypographyClassName(settings)
}

export function resolveHeadingPresentation(settings: HeadingBlockSettings | unknown): HeadingPresentation {
  const normalized = normalizeHeadingSettings(settings)

  return {
    tag: resolveHeadingTag(normalized.level),
    typographyClassName: resolveHeadingClassName(normalized),
    containerClassName: `book-heading ${resolveHeadingClassName(normalized)}`,
  }
}

export function HeadingBlockPresentation({ settings, children }: HeadingBlockPresentationProps) {
  const presentation = resolveHeadingPresentation(settings)
  const HeadingTag = presentation.tag

  return <HeadingTag className={presentation.containerClassName}>{children}</HeadingTag>
}