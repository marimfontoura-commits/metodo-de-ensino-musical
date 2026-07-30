import type { TextBlockData } from './types'
import '../../../styles/blocks.css'

interface TextBlockViewProps {
  block: TextBlockData
}

export function TextBlockView({ block }: TextBlockViewProps) {
  return <p className="book-text">{block.content.text || 'Paragrafo sem texto'}</p>
}
