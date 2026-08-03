import { useMemo, useState } from 'react'
import { generatePianoKeyboard } from '../../../music/piano'
import { ModalDialog } from '../../editor/ModalDialog'
import { PianoKeyboard } from './PianoKeyboard'
import type { NormalizedPianoBlockContent, NormalizedPianoBlockSettings } from './types'

interface PianoExpectedAnswerEditorProps {
  content: NormalizedPianoBlockContent
  settings: NormalizedPianoBlockSettings
  onSave: (expectedNoteIds: string[]) => void
}

export function PianoExpectedAnswerEditor({ content, settings, onSave }: PianoExpectedAnswerEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftNoteIds, setDraftNoteIds] = useState<string[]>([])
  const [validationMessage, setValidationMessage] = useState('')
  const keyboard = useMemo(
    () => generatePianoKeyboard(content.firstNote, content.octaveCount),
    [content.firstNote, content.octaveCount],
  )
  const draftNotes = useMemo(() => new Set(draftNoteIds), [draftNoteIds])
  const hasExpectedAnswer = settings.expectedNoteIds.length > 0

  function openEditor() {
    setDraftNoteIds(settings.expectedNoteIds)
    setValidationMessage('')
    setIsOpen(true)
  }

  function closeEditor() {
    setIsOpen(false)
    setValidationMessage('')
  }

  function toggleDraftNote(noteId: string) {
    setValidationMessage('')
    if (draftNoteIds.includes(noteId)) {
      setDraftNoteIds(draftNoteIds.filter((item) => item !== noteId))
      return
    }

    if (settings.maxSelections !== null && draftNoteIds.length >= settings.maxSelections) {
      setValidationMessage(`Selecione no máximo ${settings.maxSelections} nota(s).`)
      return
    }

    setDraftNoteIds([...draftNoteIds, noteId])
  }

  function saveAnswer() {
    if (draftNoteIds.length < settings.minSelections) {
      setValidationMessage(`Selecione pelo menos ${settings.minSelections} nota(s) antes de salvar.`)
      return
    }

    if (settings.maxSelections !== null && draftNoteIds.length > settings.maxSelections) {
      setValidationMessage(`Selecione no máximo ${settings.maxSelections} nota(s).`)
      return
    }

    onSave(draftNoteIds)
    closeEditor()
  }

  return (
    <section className="piano-expected-answer" aria-label="Resposta esperada">
      <h4>Resposta esperada</h4>
      <p>
        {hasExpectedAnswer
          ? `${settings.expectedNoteIds.length} nota(s): ${settings.expectedNoteIds.join(' – ')}`
          : 'Nenhuma nota cadastrada.'}
      </p>
      <div className="piano-expected-answer-actions">
        <button type="button" className="ghost-button" onClick={openEditor}>
          {hasExpectedAnswer ? 'Editar resposta' : 'Definir resposta'}
        </button>
        {hasExpectedAnswer ? (
          <button type="button" className="ghost-button" onClick={() => onSave([])}>Limpar resposta</button>
        ) : null}
      </div>

      <ModalDialog isOpen={isOpen} title="Definir resposta esperada" onClose={closeEditor}>
        <div className="quiz-modal-header">
          <h3 className="quiz-modal-title">Definir resposta esperada</h3>
          <button type="button" className="ghost-button" onClick={closeEditor}>Fechar</button>
        </div>
        <div className="piano-expected-answer-modal">
          <p>Selecione no teclado as notas que devem ser consideradas corretas.</p>
          <PianoKeyboard
            keys={keyboard.keys}
            totalWhites={keyboard.totalWhites}
            showNoteNames={content.showNoteNames}
            highlightedNoteIds={new Set<string>()}
            answerSelectedNoteIds={draftNotes}
            onPress={toggleDraftNote}
          />
          <p className="piano-expected-answer-summary" role="status">
            {draftNoteIds.length} nota(s) selecionada(s)
            {draftNoteIds.length > 0 ? `: ${draftNoteIds.join(' – ')}` : ''}
          </p>
          {validationMessage ? <p className="piano-expected-answer-error" role="alert">{validationMessage}</p> : null}
          <div className="piano-expected-answer-modal-actions">
            <button type="button" className="ghost-button" onClick={() => { setDraftNoteIds([]); setValidationMessage('') }}>Limpar</button>
            <button type="button" className="ghost-button" onClick={closeEditor}>Cancelar</button>
            <button type="button" className="mode-button" onClick={saveAnswer}>Salvar resposta</button>
          </div>
        </div>
      </ModalDialog>
    </section>
  )
}
