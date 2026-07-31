import type { TextBlockData } from './types'
import { TextBlockPresentation } from './TextBlockPresentation'
import '../../../styles/blocks.css'

interface TextBlockViewProps {
  block: TextBlockData
}

export function TextBlockView({ block }: TextBlockViewProps) {
  return (
    <TextBlockPresentation settings={block.settings}>
      {block.content.text || 'Paragrafo sem texto'}
    </TextBlockPresentation>
  )
}
