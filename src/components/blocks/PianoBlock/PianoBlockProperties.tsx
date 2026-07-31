import { clampPianoOctaveCount } from '../../../music/piano'
import { normalizePianoContent, type PianoBlockData } from './types'
import '../../../styles/blocks.css'

interface PianoBlockPropertiesProps {
  block: PianoBlockData
  onChange: (next: PianoBlockData) => void
}

export function PianoBlockProperties({ block, onChange }: PianoBlockPropertiesProps) {
  const content = normalizePianoContent(block.content)

  function updateContent(nextPatch: Partial<typeof content>) {
    onChange({
      ...block,
      content: normalizePianoContent({
        ...content,
        ...nextPatch,
      }),
    })
  }

  return (
    <div className="block-content">
      <label className="field-label" htmlFor={`piano-octaves-${block.id}`}>
        Quantidade de oitavas
      </label>
      <select
        id={`piano-octaves-${block.id}`}
        className="select-input"
        value={content.octaveCount}
        onChange={(event) =>
          updateContent({
            octaveCount: clampPianoOctaveCount(event.target.value, content.octaveCount),
          })
        }
      >
        <option value={1}>1 oitava</option>
        <option value={2}>2 oitavas</option>
        <option value={3}>3 oitavas</option>
      </select>

      <label className="field-label" htmlFor={`piano-show-notes-${block.id}`}>
        <input
          id={`piano-show-notes-${block.id}`}
          type="checkbox"
          checked={content.showNoteNames}
          onChange={(event) =>
            updateContent({
              showNoteNames: event.target.checked,
            })
          }
        />{' '}
        Mostrar nome das notas
      </label>
    </div>
  )
}
