import {
  normalizeHeadingAlignment,
  normalizeHeadingLevel,
  normalizeHeadingSettings,
  type HeadingBlockData,
} from './types'
import '../../../styles/blocks.css'

interface HeadingBlockPropertiesProps {
  block: HeadingBlockData
  onChange: (next: HeadingBlockData) => void
}

export function HeadingBlockProperties({ block, onChange }: HeadingBlockPropertiesProps) {
  const settings = normalizeHeadingSettings(block.settings)

  return (
    <div className="block-content">
      <label className="field-label" htmlFor={`heading-level-${block.id}`}>
        Hierarquia
      </label>
      <select
        id={`heading-level-${block.id}`}
        className="select-input"
        value={settings.level}
        onChange={(event) =>
          onChange({
            ...block,
            settings: {
              ...settings,
              level: normalizeHeadingLevel(Number(event.target.value)),
            },
          })
        }
      >
        <option value={1}>H1</option>
        <option value={2}>H2</option>
        <option value={3}>H3</option>
      </select>

      <label className="field-label" htmlFor={`heading-align-${block.id}`}>
        Alinhamento
      </label>
      <select
        id={`heading-align-${block.id}`}
        className="select-input"
        value={settings.alignment}
        onChange={(event) =>
          onChange({
            ...block,
            settings: {
              ...settings,
              alignment: normalizeHeadingAlignment(event.target.value),
            },
          })
        }
      >
        <option value="left">Esquerda</option>
        <option value="center">Centro</option>
        <option value="right">Direita</option>
      </select>

      <label className="field-label" htmlFor={`heading-bold-${block.id}`}>
        <input
          id={`heading-bold-${block.id}`}
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

      <label className="field-label" htmlFor={`heading-italic-${block.id}`}>
        <input
          id={`heading-italic-${block.id}`}
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