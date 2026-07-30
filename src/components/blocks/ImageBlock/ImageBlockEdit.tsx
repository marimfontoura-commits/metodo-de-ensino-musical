import type { ImageBlockData } from './types'
import {
  CONTENT_ALIGNMENT_OPTIONS,
  CONTENT_WIDTH_OPTIONS,
} from '../../../models/layoutOptions'
import {
  normalizeContentAlignment,
  normalizeContentWidth,
  toAlignmentClass,
  toWidthClass,
} from '../../../services/layoutOptionsService'
import '../../../styles/blocks.css'

interface ImageBlockEditProps {
  block: ImageBlockData
  onChange: (next: ImageBlockData) => void
}

export function ImageBlockEdit({ block, onChange }: ImageBlockEditProps) {
  const width = normalizeContentWidth(block.settings?.width)
  const alignment = normalizeContentAlignment(block.settings?.alignment)

  return (
    <div className="block-content">
      <label className="field-label" htmlFor={`img-url-${block.id}`}>
        URL da imagem
      </label>
      <input
        id={`img-url-${block.id}`}
        className="text-input"
        value={block.content.url}
        onChange={(event) =>
          onChange({
            ...block,
            content: {
              ...block.content,
              url: event.target.value,
            },
          })
        }
        placeholder="https://..."
      />
      <label className="field-label" htmlFor={`img-alt-${block.id}`}>
        Texto alternativo
      </label>
      <input
        id={`img-alt-${block.id}`}
        className="text-input"
        value={block.content.alt}
        onChange={(event) =>
          onChange({
            ...block,
            content: {
              ...block.content,
              alt: event.target.value,
            },
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

      {block.content.url.trim() ? (
        <div className={`media-frame ${toWidthClass(width)} ${toAlignmentClass(alignment)}`}>
          <img
            className={block.settings.rounded ? 'book-image rounded' : 'book-image'}
            src={block.content.url}
            alt={block.content.alt || 'Imagem'}
          />
        </div>
      ) : null}
    </div>
  )
}
