import {
  hasRenderableImage,
  normalizeImageSourceContent,
  useResolvedImageSource,
  type ImageSourceContent,
} from '../imageSource'

interface QuizImagePreviewProps {
  image?: ImageSourceContent
  fallbackAlt: string
  className: string
  frameClassName?: string
  fitMode?: 'contain' | 'cover'
}

export function QuizImagePreview({
  image,
  fallbackAlt,
  className,
  frameClassName,
  fitMode = 'contain',
}: QuizImagePreviewProps) {
  const normalized = normalizeImageSourceContent(image)
  const source = useResolvedImageSource(normalized)

  if (!hasRenderableImage(normalized)) {
    return null
  }

  if (source.status === 'missing') {
    const note = <span className="quiz-option-note">Imagem local nao encontrada.</span>
    return frameClassName ? <span className={frameClassName}>{note}</span> : note
  }

  if (source.status === 'error') {
    const note = <span className="quiz-option-note">Nao foi possivel carregar a imagem.</span>
    return frameClassName ? <span className={frameClassName}>{note}</span> : note
  }

  if (!source.src) {
    return null
  }

  const imageNode = (
    <img
      className={`${className} ${fitMode === 'cover' ? 'fit-cover' : 'fit-contain'}`}
      src={source.src}
      alt={normalized.alt || fallbackAlt}
    />
  )

  return frameClassName ? <span className={frameClassName}>{imageNode}</span> : imageNode
}