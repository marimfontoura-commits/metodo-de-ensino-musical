import type { HeadingBlockData } from './types'
import { HeadingBlockPresentation } from './HeadingBlockPresentation'
import '../../../styles/blocks.css'

interface HeadingBlockViewProps {
  block: HeadingBlockData
}

export function HeadingBlockView({ block }: HeadingBlockViewProps) {
  return (
    <HeadingBlockPresentation settings={block.settings}>
      {block.content.text || 'Titulo sem texto'}
    </HeadingBlockPresentation>
  )
}
