import { useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  ACCEPTED_IMAGE_FILE_INPUT,
  normalizeImageSourceContent,
  saveImageFileAsLocalSource,
  type ImageSourceContent,
} from '../imageSource'

interface QuizInlineImageEditorProps {
  idPrefix: string
  label: string
  value?: ImageSourceContent
  onChange: (next: ImageSourceContent | undefined) => void
}

export function QuizInlineImageEditor({ idPrefix, label, value, onChange }: QuizInlineImageEditorProps) {
  const image = normalizeImageSourceContent(value)
  const hasImage = image.url.trim() !== '' || image.localAssetId.trim() !== ''
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isSavingFile, setIsSavingFile] = useState(false)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploadError('')
    setIsSavingFile(true)

    const result = await saveImageFileAsLocalSource(file)
    if ('error' in result) {
      setUploadError(result.error)
      setIsSavingFile(false)
      event.target.value = ''
      return
    }

    onChange({
      ...image,
      ...result.source,
      sourceType: 'local',
      url: '',
    })
    setIsSavingFile(false)
    event.target.value = ''
  }

  return (
    <div
      className="quiz-inline-image-control"
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <button
        type="button"
        className={hasImage ? 'icon-button is-active' : 'icon-button'}
        title={hasImage ? `Editar imagem de ${label}` : `Adicionar imagem em ${label}`}
        aria-label={hasImage ? `Editar imagem de ${label}` : `Adicionar imagem em ${label}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()

          if (!hasImage) {
            onChange({ sourceType: 'url', url: '', alt: '' })
          }

          setIsPanelOpen((current) => !current)
        }}
      >
        Img
      </button>

      {isPanelOpen ? (
        <div
          className="quiz-inline-image-panel"
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          <label className="field-label" htmlFor={`${idPrefix}-source`}>
            Origem da imagem
          </label>
          <select
            id={`${idPrefix}-source`}
            className="select-input"
            value={image.sourceType}
            onChange={(event) => {
              event.stopPropagation()
              const nextType = event.target.value === 'local' ? 'local' : 'url'
              setUploadError('')

              if (nextType === 'url') {
                onChange({
                  ...image,
                  sourceType: 'url',
                  localAssetId: '',
                  localFileName: '',
                })
                return
              }

              onChange({
                ...image,
                sourceType: 'local',
                url: '',
              })
            }}
          >
            <option value="url">URL externa</option>
            <option value="local">Arquivo local</option>
          </select>

          {image.sourceType === 'url' ? (
            <>
              <label className="field-label" htmlFor={`${idPrefix}-url`}>
                URL da imagem
              </label>
              <input
                id={`${idPrefix}-url`}
                className="text-input"
                value={image.url}
                onChange={(event) =>
                  onChange({
                    ...image,
                    sourceType: 'url',
                    url: event.target.value,
                  })
                }
                placeholder="https://..."
              />
            </>
          ) : (
            <>
              <label className="field-label" htmlFor={`${idPrefix}-file`}>
                Arquivo local
              </label>
              <input
                id={`${idPrefix}-file`}
                className="text-input"
                type="file"
                accept={ACCEPTED_IMAGE_FILE_INPUT}
                onChange={handleFileChange}
              />
              <p className="field-help">
                {image.localFileName ? `Arquivo atual: ${image.localFileName}` : 'Nenhum arquivo selecionado.'}
              </p>
              {isSavingFile ? <p className="field-help">Salvando arquivo local...</p> : null}
            </>
          )}

          <label className="field-label" htmlFor={`${idPrefix}-alt`}>
            Texto alternativo
          </label>
          <input
            id={`${idPrefix}-alt`}
            className="text-input"
            value={image.alt}
            onChange={(event) =>
              onChange({
                ...image,
                alt: event.target.value,
              })
            }
            placeholder="Descricao da imagem"
          />

          <div className="field-row">
            <button
              type="button"
              className="ghost-button"
              title={`Remover imagem de ${label}`}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onChange(undefined)
                setUploadError('')
                setIsPanelOpen(false)
              }}
            >
              Remover imagem
            </button>
            <button
              type="button"
              className="ghost-button"
              title="Fechar painel"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setIsPanelOpen(false)
              }}
            >
              Fechar
            </button>
          </div>

          {uploadError ? <p className="field-error">{uploadError}</p> : null}
        </div>
      ) : null}
    </div>
  )
}