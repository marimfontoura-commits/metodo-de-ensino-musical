import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { ImageBlockData } from './types'
import { normalizeImageContent } from './types'
import {
  CONTENT_ALIGNMENT_OPTIONS,
  CONTENT_WIDTH_OPTIONS,
} from '../../../models/layoutOptions'
import {
  normalizeContentAlignment,
  normalizeContentWidth,
} from '../../../services/layoutOptionsService'
import { ImageBlockMedia } from './ImageBlockMedia'
import { ACCEPTED_IMAGE_FILE_INPUT, saveImageFileAsLocalSource } from '../imageSource'
import '../../../styles/blocks.css'

interface ImageBlockEditProps {
  block: ImageBlockData
  onChange: (next: ImageBlockData) => void
}

export function ImageBlockEdit({ block, onChange }: ImageBlockEditProps) {
  const content = normalizeImageContent(block.content)
  const width = normalizeContentWidth(block.settings?.width)
  const alignment = normalizeContentAlignment(block.settings?.alignment)
  const [uploadError, setUploadError] = useState('')
  const [isSavingFile, setIsSavingFile] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewSrc) {
        URL.revokeObjectURL(previewSrc)
      }
    }
  }, [previewSrc])

  function updateContent(nextContent: Partial<ImageBlockData['content']>) {
    onChange({
      ...block,
      content: {
        ...content,
        ...nextContent,
      },
    })
  }

  async function handleLocalFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploadError('')
    setIsSavingFile(true)

    if (previewSrc) {
      URL.revokeObjectURL(previewSrc)
    }

    const immediatePreviewUrl = URL.createObjectURL(file)
    setPreviewSrc(immediatePreviewUrl)

    try {
      const savedResult = await saveImageFileAsLocalSource(file)
      if ('error' in savedResult) {
        setUploadError(savedResult.error)
        return
      }

      updateContent({
        sourceType: 'local',
        localAssetId: savedResult.source.localAssetId,
        localFileName: savedResult.source.localFileName,
      })
    } finally {
      setIsSavingFile(false)
      event.target.value = ''
    }
  }

  return (
    <div className="block-content">
      <label className="field-label" htmlFor={`img-source-${block.id}`}>
        Origem da imagem
      </label>
      <select
        id={`img-source-${block.id}`}
        className="select-input"
        value={content.sourceType}
        onChange={(event) => {
          const nextSourceType = event.target.value === 'local' ? 'local' : 'url'
          setUploadError('')

          if (nextSourceType === 'url') {
            if (previewSrc) {
              URL.revokeObjectURL(previewSrc)
              setPreviewSrc(null)
            }

            updateContent({
              sourceType: 'url',
              localAssetId: '',
            })
            return
          }

          updateContent({
            sourceType: 'local',
          })
        }}
      >
        <option value="url">URL externa</option>
        <option value="local">Arquivo do computador</option>
      </select>

      {content.sourceType === 'url' ? (
        <>
          <label className="field-label" htmlFor={`img-url-${block.id}`}>
            URL da imagem
          </label>
          <input
            id={`img-url-${block.id}`}
            className="text-input"
            value={content.url}
            onChange={(event) =>
              updateContent({
                sourceType: 'url',
                url: event.target.value,
              })
            }
            placeholder="https://..."
          />
        </>
      ) : (
        <>
          <label className="field-label" htmlFor={`img-file-${block.id}`}>
            Arquivo local
          </label>
          <input
            id={`img-file-${block.id}`}
            className="text-input"
            type="file"
            accept={ACCEPTED_IMAGE_FILE_INPUT}
            onChange={handleLocalFileChange}
          />
          <p className="field-help">
            {content.localFileName ? `Arquivo atual: ${content.localFileName}` : 'Nenhum arquivo selecionado.'}
          </p>
          {isSavingFile ? <p className="field-help">Salvando arquivo local...</p> : null}
          {uploadError ? <p className="field-error">{uploadError}</p> : null}
        </>
      )}

      <label className="field-label" htmlFor={`img-alt-${block.id}`}>
        Texto alternativo
      </label>
      <input
        id={`img-alt-${block.id}`}
        className="text-input"
        value={content.alt}
        onChange={(event) =>
          updateContent({
            alt: event.target.value,
          })
        }
        placeholder="Descricao da imagem"
      />

      <label className="field-label" htmlFor={`img-width-${block.id}`}>
        Largura
      </label>
      <select
        id={`img-width-${block.id}`}
        className="select-input"
        value={width}
        onChange={(event) =>
          onChange({
            ...block,
            settings: {
              ...block.settings,
              width: normalizeContentWidth(event.target.value),
              alignment,
            },
          })
        }
      >
        {CONTENT_WIDTH_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className="field-label" htmlFor={`img-align-${block.id}`}>
        Alinhamento
      </label>
      <select
        id={`img-align-${block.id}`}
        className="select-input"
        value={alignment}
        onChange={(event) =>
          onChange({
            ...block,
            settings: {
              ...block.settings,
              width,
              alignment: normalizeContentAlignment(event.target.value),
            },
          })
        }
      >
        {CONTENT_ALIGNMENT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ImageBlockMedia block={block} previewSrc={previewSrc} emptyMessage="Imagem sem URL" />
    </div>
  )
}
