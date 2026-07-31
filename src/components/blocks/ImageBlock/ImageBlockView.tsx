import type { ImageBlockData } from './types'
import { ImageBlockMedia } from './ImageBlockMedia'
import '../../../styles/blocks.css'

interface ImageBlockViewProps {
  block: ImageBlockData
}

export function ImageBlockView({ block }: ImageBlockViewProps) {
  return <ImageBlockMedia block={block} emptyMessage="Imagem sem URL" />
}
