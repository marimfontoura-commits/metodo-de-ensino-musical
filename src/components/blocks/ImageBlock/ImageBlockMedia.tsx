import type { ImageBlockData } from './types'
import { normalizeImageContent } from './types'
import {
  normalizeContentAlignment,
  normalizeContentWidth,
  toAlignmentClass,
  toWidthClass,
} from '../../../services/layoutOptionsService'
import { useResolvedImageSource } from '../imageSource'
import '../../../styles/blocks.css'

interface ImageBlockMediaProps {
  block: ImageBlockData
  previewSrc?: string | null
  emptyMessage: string
}

export function ImageBlockMedia({ block, previewSrc, emptyMessage }: ImageBlockMediaProps) {
  const content = normalizeImageContent(block.content)
  const width = normalizeContentWidth(block.settings?.width)
  const alignment = normalizeContentAlignment(block.settings?.alignment)
  const source = useResolvedImageSource(content, previewSrc)

  if (content.sourceType === 'url' && !content.url.trim()) {
    return <p className="book-text">{emptyMessage}</p>
  }

  if (content.sourceType === 'local' && source.status === 'missing') {
    return <p className="block-note">Imagem local nao encontrada.</p>
  }

  if (content.sourceType === 'local' && source.status === 'error') {
    return <p className="block-note">Nao foi possivel carregar a imagem local.</p>
  }

  if (!source.src) {
    return null
  }

  return (
    <div className={`media-frame ${toWidthClass(width)} ${toAlignmentClass(alignment)}`}>
      <img
        className={`${block.settings.rounded ? 'book-image rounded' : 'book-image'} fit-${block.settings.fit ?? 'contain'}`}
        src={source.src}
        alt={content.alt || 'Imagem'}
      />
    </div>
  )
}
