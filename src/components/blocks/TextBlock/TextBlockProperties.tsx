import { normalizeTextSettings, type TextBlockData } from './types'
import { normalizeTypographyAlignment } from '../typography'
import '../../../styles/blocks.css'

interface TextBlockPropertiesProps {
  block: TextBlockData
  onChange: (next: TextBlockData) => void
}

export function TextBlockProperties({ block, onChange }: TextBlockPropertiesProps) {
  const settings = normalizeTextSettings(block.settings)

  return (
    <div className="block-content">
      <label className="field-label" htmlFor={`text-align-${block.id}`}>
        Alinhamento
      </label>
      <select
        id={`text-align-${block.id}`}
        className="select-input"
        value={settings.alignment}
        onChange={(event) =>
          onChange({
            ...block,
            settings: {
              ...settings,
              alignment: normalizeTypographyAlignment(event.target.value, settings.alignment),
            },
          })
        }
      >
        <option value="left">Esquerda</option>
        <option value="center">Centro</option>
        <option value="right">Direita</option>
        <option value="justify">Justificado</option>
      </select>

      <label className="field-label" htmlFor={`text-bold-${block.id}`}>
        <input
          id={`text-bold-${block.id}`}
          type="checkbox"
          checked={settings.bold}
          onChange={(event) =>
            onChange({
              ...block,
              settings: {
                ...settings,
                bold: event.target.checked,
              },
            })
          }
        />{' '}
        Negrito
      </label>

      <label className="field-label" htmlFor={`text-italic-${block.id}`}>
        <input
          id={`text-italic-${block.id}`}
          type="checkbox"
          checked={settings.italic}
          onChange={(event) =>
            onChange({
              ...block,
              settings: {
                ...settings,
                italic: event.target.checked,
              },
            })
          }
        />{' '}
        Italico
      </label>
    </div>
  )
}