import { useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import type { BookBlock } from '../../../models/book'
import type { QuizAttachableBlockOption, QuizAttachmentEditorSize, QuizAttachmentTarget } from '../types'
import { ModalDialog } from '../../editor/ModalDialog'

interface QuizResourceSlotProps {
  label: string
  emptyButtonLabel?: string
  pickerTitle?: string
  currentBlockId?: string
  allBlocks: BookBlock[]
  target: QuizAttachmentTarget
  attachableOptions: QuizAttachableBlockOption[]
  renderAttachment: (blockId: string) => ReactElement | null
  renderAttachmentEditor: (block: BookBlock, onChange: (next: BookBlock) => void) => ReactElement | null
  getAttachmentEditorSize: (block: BookBlock) => QuizAttachmentEditorSize
  onCreate: (type: string, target: QuizAttachmentTarget) => BookBlock | null
  onUpdate: (blockId: string, next: BookBlock) => void
  onMoveToRoot: (blockId: string, quizBlockId: string) => void
}

export function QuizResourceSlot({
  label,
  emptyButtonLabel = '+ Adicionar recurso',
  pickerTitle = 'Adicionar recurso',
  currentBlockId,
  allBlocks,
  target,
  attachableOptions,
  renderAttachment,
  renderAttachmentEditor,
  getAttachmentEditorSize,
  onCreate,
  onUpdate,
  onMoveToRoot,
}: QuizResourceSlotProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<BookBlock | null>(null)
  const attachedBlock = useMemo(
    () => allBlocks.find((candidate) => candidate.id === currentBlockId),
    [allBlocks, currentBlockId],
  )
  const latestEditingBlock = editingBlock
    ? allBlocks.find((candidate) => candidate.id === editingBlock.id) ?? editingBlock
    : null

  function createResource(type: string) {
    const created = onCreate(type, target)
    setIsPickerOpen(false)
    if (created) {
      setEditingBlock(created)
    }
  }

  function updateResource(next: BookBlock) {
    setEditingBlock(next)
    onUpdate(next.id, next)
  }

  if (!attachedBlock) {
    return (
      <div className="quiz-resource-slot" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="ghost-button" onClick={() => setIsPickerOpen(true)}>
          {emptyButtonLabel}
        </button>
        <ModalDialog isOpen={isPickerOpen} title={`Adicionar recurso em ${label}`} onClose={() => setIsPickerOpen(false)}>
          <div className="quiz-modal-header">
            <h3 className="quiz-modal-title">{pickerTitle}</h3>
            <button type="button" className="ghost-button" onClick={() => setIsPickerOpen(false)}>Fechar</button>
          </div>
          <div className="quiz-resource-picker" role="list" aria-label="Tipos de recurso">
            {attachableOptions.map((option) => (
              <button
                key={option.type}
                type="button"
                className="quiz-resource-option"
                onClick={() => createResource(option.type)}
              >
                <strong aria-hidden="true">{option.icon}</strong>
                {option.name}
              </button>
            ))}
          </div>
        </ModalDialog>
      </div>
    )
  }

  return (
    <div className="quiz-resource-slot is-filled" onClick={(event) => event.stopPropagation()}>
      <div className="quiz-resource-preview">{renderAttachment(attachedBlock.id)}</div>
      <div className="quiz-resource-actions">
        <button type="button" className="ghost-button" onClick={() => setEditingBlock(attachedBlock)}>
          Editar
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={() => onMoveToRoot(attachedBlock.id, target.quizBlockId)}
        >
          Colocar no livro
        </button>
      </div>
      <ModalDialog
        isOpen={Boolean(latestEditingBlock)}
        title={`Editar recurso de ${label}`}
        onClose={() => setEditingBlock(null)}
        size={latestEditingBlock ? getAttachmentEditorSize(latestEditingBlock) : 'default'}
      >
        <div className="quiz-modal-header">
          <h3 className="quiz-modal-title">Editar recurso</h3>
          <button type="button" className="ghost-button" onClick={() => setEditingBlock(null)}>Fechar</button>
        </div>
        {latestEditingBlock ? renderAttachmentEditor(latestEditingBlock, updateResource) : null}
      </ModalDialog>
    </div>
  )
}
