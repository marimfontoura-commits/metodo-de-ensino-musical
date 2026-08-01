import { useRef } from 'react'
import { clampPianoOctaveCount } from '../../../music/piano'
import {
  normalizePianoContent,
  normalizePianoSettings,
  type PianoBlockData,
  type PianoInteractionMode,
} from './types'
import '../../../styles/blocks.css'
import { PianoExpectedAnswerEditor } from './PianoExpectedAnswerEditor'

interface PianoBlockPropertiesProps {
  block: PianoBlockData
  onChange: (next: PianoBlockData) => void
}

export function PianoBlockProperties({ block, onChange }: PianoBlockPropertiesProps) {
  const content = normalizePianoContent(block.content)
  const settings = normalizePianoSettings(block.settings)
  const lastInteractiveModeRef = useRef<PianoInteractionMode>(
    settings.interactionMode === 'select-notes' ? 'select-notes' : 'explore',
  )
  const allowsLearnerInteraction = settings.interactionMode !== 'static'

  function updateContent(nextPatch: Partial<typeof content>) {
    onChange({
      ...block,
      content: normalizePianoContent({
        ...content,
        ...nextPatch,
      }),
    })
  }

  function updateSettings(nextPatch: Partial<typeof settings>) {
    onChange({
      ...block,
      settings: normalizePianoSettings({
        ...settings,
        ...nextPatch,
      }),
    })
  }

  function updateInteractionMode(interactionMode: PianoInteractionMode) {
    lastInteractiveModeRef.current = interactionMode
    const learnerRole = interactionMode === 'select-notes' ? 'response' : 'support'
    updateSettings({ learnerRole, interactionMode })
  }

  function toggleLearnerInteraction(enabled: boolean) {
    if (!enabled) {
      if (settings.interactionMode !== 'static') {
        lastInteractiveModeRef.current = settings.interactionMode
      }
      updateSettings({ learnerRole: 'stimulus', interactionMode: 'static' })
      return
    }

    updateInteractionMode(lastInteractiveModeRef.current)
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

      <fieldset className="piano-interaction-settings">
        <legend>Interação da aluna</legend>

        <label className="field-label" htmlFor={`piano-allows-interaction-${block.id}`}>
          <input
            id={`piano-allows-interaction-${block.id}`}
            type="checkbox"
            checked={allowsLearnerInteraction}
            onChange={(event) => toggleLearnerInteraction(event.target.checked)}
          />{' '}
          Permitir interação da aluna
        </label>
        <p className="field-help">Quando desativado, o Piano será apenas exibido no modo Visualizar.</p>

        {allowsLearnerInteraction ? (
          <div className="piano-interaction-expanded">
            <span className="field-label">Tipo de interação</span>

            <label className="piano-interaction-choice">
              <input
                type="radio"
                name={`piano-interaction-${block.id}`}
                value="explore"
                checked={settings.interactionMode === 'explore'}
                onChange={() => updateInteractionMode('explore')}
              />
              <span>
                Explorar livremente
                <small>A aluna pode pressionar as teclas livremente para explorar o instrumento.</small>
              </span>
            </label>

            <label className="piano-interaction-choice">
              <input
                type="radio"
                name={`piano-interaction-${block.id}`}
                value="select-notes"
                checked={settings.interactionMode === 'select-notes'}
                onChange={() => updateInteractionMode('select-notes')}
              />
              <span>
                Responder selecionando notas
                <small>A aluna deverá selecionar notas como resposta da atividade.</small>
              </span>
            </label>

            {settings.interactionMode === 'select-notes' ? (
              <div className="piano-response-settings">
                <label className="field-label" htmlFor={`piano-min-selections-${block.id}`}>Mínimo</label>
                <input
                  id={`piano-min-selections-${block.id}`}
                  className="text-input"
                  type="number"
                  min={0}
                  value={settings.minSelections}
                  onChange={(event) => updateSettings({ minSelections: Number(event.target.value) })}
                />

                <label className="field-label" htmlFor={`piano-max-selections-${block.id}`}>Máximo</label>
                <input
                  id={`piano-max-selections-${block.id}`}
                  className="text-input"
                  type="number"
                  min={settings.minSelections}
                  placeholder="Sem limite"
                  value={settings.maxSelections ?? ''}
                  onChange={(event) => updateSettings({
                    maxSelections: event.target.value === '' ? null : Number(event.target.value),
                  })}
                />

                <label className="field-label" htmlFor={`piano-comparison-${block.id}`}>Modo de comparação</label>
                <select
                  id={`piano-comparison-${block.id}`}
                  className="select-input"
                  value={settings.comparisonMode}
                  onChange={() => updateSettings({ comparisonMode: 'exact' })}
                >
                  <option value="exact">Correspondência exata</option>
                </select>
                <p className="field-help">A comparação será utilizada em uma sprint futura.</p>

                <PianoExpectedAnswerEditor
                  content={content}
                  settings={settings}
                  onSave={(expectedNoteIds) => updateSettings({ expectedNoteIds })}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </fieldset>
    </div>
  )
}
