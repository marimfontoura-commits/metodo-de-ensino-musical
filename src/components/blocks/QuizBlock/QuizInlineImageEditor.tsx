import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  ACCEPTED_IMAGE_FILE_INPUT,
  normalizeImageSourceContent,
  saveImageFileAsLocalSource,
  type ImageSourceContent,
} from '../imageSource'
import { ModalDialog } from '../../editor/ModalDialog'

interface QuizInlineImageEditorProps {
  idPrefix: string
  label: string
  value?: ImageSourceContent
  onChange: (next: ImageSourceContent | undefined) => void
}

export function QuizInlineImageEditor({ idPrefix, label, value, onChange }: QuizInlineImageEditorProps) {
  const image = normalizeImageSourceContent(value)
  const hasImage = image.url.trim() !== '' || image.localAssetId.trim() !== ''
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isSavingFile, setIsSavingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  function openDialog() {
    if (!hasImage) {
      onChange({ sourceType: 'url', url: '', alt: '' })
    }

    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
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
          openDialog()
        }}
      >
        <span className="icon-mark" aria-hidden="true">
          &#128247;
        </span>
      </button>

      <ModalDialog isOpen={isDialogOpen} title={`Imagem da ${label}`} onClose={closeDialog}>
        <div className="quiz-modal-header">
          <h3 className="quiz-modal-title">Imagem da {label}</h3>
          <button
            type="button"
            className="icon-button"
            title="Fechar editor de imagem"
            aria-label="Fechar editor de imagem"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              closeDialog()
            }}
          >
            <span className="icon-mark" aria-hidden="true">
              &times;
            </span>
          </button>
        </div>

        <div className="quiz-inline-image-panel">
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
                ref={fileInputRef}
                className="file-input-hidden"
                type="file"
                accept={ACCEPTED_IMAGE_FILE_INPUT}
                onChange={handleFileChange}
              />
              <input
                className="text-input"
                readOnly
                value={image.localFileName || 'Nenhum arquivo selecionado.'}
                aria-label="Arquivo selecionado"
              />
              <button
                type="button"
                className="ghost-button"
                title="Escolher arquivo local"
                aria-label="Escolher arquivo local"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                Escolher arquivo local
              </button>
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
                closeDialog()
              }}
            >
              Remover imagem
            </button>
            <button
              type="button"
              className="ghost-button"
              title="Fechar modal"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                closeDialog()
              }}
            >
              Fechar
            </button>
          </div>

          {uploadError ? <p className="field-error">{uploadError}</p> : null}
        </div>
      </ModalDialog>
    </div>
  )
}