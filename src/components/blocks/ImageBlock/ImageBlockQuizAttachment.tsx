import type { ImageBlockData } from './types'
import { ImageBlockMedia } from './ImageBlockMedia'
import '../../../styles/blocks.css'

interface ImageBlockQuizAttachmentProps {
  block: ImageBlockData
}

export function ImageBlockQuizAttachment({ block }: ImageBlockQuizAttachmentProps) {
  return <ImageBlockMedia block={block} emptyMessage="Imagem sem URL" />
}
