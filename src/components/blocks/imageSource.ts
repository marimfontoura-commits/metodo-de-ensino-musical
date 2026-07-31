import { useEffect, useState } from 'react'
import { getLocalImageAssetBlob } from '../../services/imageAssetStorageService'
import { saveLocalImageAsset } from '../../services/imageAssetStorageService'

export type ImageSourceType = 'url' | 'local'

export interface ImageSourceContent {
  sourceType?: ImageSourceType
  url?: string
  localAssetId?: string
  localFileName?: string
  alt?: string
}

export interface NormalizedImageSourceContent {
  sourceType: ImageSourceType
  url: string
  localAssetId: string
  localFileName: string
  alt: string
}

export const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
] as const

export const ACCEPTED_IMAGE_FILE_INPUT = '.png,.jpg,.jpeg,.webp,image/png,image/jpg,image/jpeg,image/webp'

export type LocalAssetStatus = 'idle' | 'loading' | 'ready' | 'missing' | 'error'

export interface ResolvedImageSource {
  src: string
  status: LocalAssetStatus
}

export interface PersistedLocalImageSource {
  sourceType: 'local'
  localAssetId: string
  localFileName: string
}

export function normalizeImageSourceContent(value: ImageSourceContent | unknown): NormalizedImageSourceContent {
  const raw = (value ?? {}) as ImageSourceContent

  return {
    sourceType: raw.sourceType === 'local' ? 'local' : 'url',
    url: typeof raw.url === 'string' ? raw.url : '',
    localAssetId: typeof raw.localAssetId === 'string' ? raw.localAssetId : '',
    localFileName: typeof raw.localFileName === 'string' ? raw.localFileName : '',
    alt: typeof raw.alt === 'string' ? raw.alt : '',
  }
}

export function hasRenderableImage(content: NormalizedImageSourceContent): boolean {
  if (content.sourceType === 'url') {
    return content.url.trim().length > 0
  }

  return content.localAssetId.trim().length > 0
}

export function isAcceptedImageFile(file: File): boolean {
  return ACCEPTED_IMAGE_MIME_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_MIME_TYPES)[number])
}

export async function saveImageFileAsLocalSource(
  file: File,
): Promise<{ source: PersistedLocalImageSource } | { error: string }> {
  if (!isAcceptedImageFile(file)) {
    return {
      error: 'Formato invalido. Use PNG, JPG, JPEG ou WebP.',
    }
  }

  try {
    const saved = await saveLocalImageAsset(file)
    return {
      source: {
        sourceType: 'local',
        localAssetId: saved.assetId,
        localFileName: saved.fileName,
      },
    }
  } catch {
    return {
      error: 'Nao foi possivel salvar a imagem local. Tente novamente.',
    }
  }
}

export function useResolvedImageSource(
  content: NormalizedImageSourceContent,
  previewSrc?: string | null,
): ResolvedImageSource {
  const [resolvedSrc, setResolvedSrc] = useState<string>('')
  const [status, setStatus] = useState<LocalAssetStatus>('idle')

  useEffect(() => {
    if (content.sourceType === 'local' && previewSrc) {
      setResolvedSrc(previewSrc)
      setStatus('ready')
      return
    }

    if (content.sourceType === 'url') {
      setResolvedSrc(content.url.trim())
      setStatus('ready')
      return
    }

    if (!content.localAssetId) {
      setResolvedSrc('')
      setStatus('missing')
      return
    }

    let objectUrl = ''
    let active = true
    setStatus('loading')

    getLocalImageAssetBlob(content.localAssetId)
      .then((blob) => {
        if (!active) {
          return
        }

        if (!blob) {
          setResolvedSrc('')
          setStatus('missing')
          return
        }

        objectUrl = URL.createObjectURL(blob)
        setResolvedSrc(objectUrl)
        setStatus('ready')
      })
      .catch(() => {
        if (!active) {
          return
        }

        setResolvedSrc('')
        setStatus('error')
      })

    return () => {
      active = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [content.localAssetId, content.sourceType, content.url, previewSrc])

  return { src: resolvedSrc, status }
}