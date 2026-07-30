import type { ImageBlockData } from './types'
import {
  normalizeContentAlignment,
  normalizeContentWidth,
  toAlignmentClass,
  toWidthClass,
} from '../../../services/layoutOptionsService'
import '../../../styles/blocks.css'

interface ImageBlockViewProps {
  block: ImageBlockData
}

export function ImageBlockView({ block }: ImageBlockViewProps) {
  const width = normalizeContentWidth(block.settings?.width)
  const alignment = normalizeContentAlignment(block.settings?.alignment)

  if (!block.content.url.trim()) {
    return <p className="book-text">Imagem sem URL</p>
  }

  return (
    <div className={`media-frame ${toWidthClass(width)} ${toAlignmentClass(alignment)}`}>
      <img
        className={block.settings.rounded ? 'book-image rounded' : 'book-image'}
        src={block.content.url}
        alt={block.content.alt || 'Imagem'}
      />
    </div>
  )
}
