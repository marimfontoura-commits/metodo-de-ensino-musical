import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import type { BookBlock, EditorMode } from '../../models/book'
import type { BlockEditComponentProps } from '../blocks/types'
import {
  BlockInlineEditRenderer,
  BlockViewRenderer,
  canBlockAttachToQuiz,
  getBlockLabel,
  hasInlineEditing,
} from '../blocks/registry'
import '../../styles/editor.css'

interface SortableBlockItemProps {
  block: BookBlock
  allBlocks: BookBlock[]
  isSelected: boolean
  mode: EditorMode
  onSelect: () => void
  onChange: (next: BookBlock) => void
  onDuplicate: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onCreateQuizAttachment?: BlockEditComponentProps['onCreateQuizAttachment']
  onUpdateQuizAttachment?: BlockEditComponentProps['onUpdateQuizAttachment']
  onMoveQuizAttachmentToRoot?: BlockEditComponentProps['onMoveQuizAttachmentToRoot']
}

export function SortableBlockItem({
  block,
  allBlocks,
  isSelected,
  mode,
  onSelect,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onCreateQuizAttachment,
  onUpdateQuizAttachment,
  onMoveQuizAttachmentToRoot,
}: SortableBlockItemProps) {
  const canAttachToQuiz = canBlockAttachToQuiz(block.type)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled: mode === 'preview',
    data: {
      kind: 'block',
      blockId: block.id,
      canAttachToQuiz,
      source: 'root',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const canEditBlock = mode === 'edit' && isSelected
  const showInlineEditor = canEditBlock && hasInlineEditing(block.type)

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={isSelected ? 'book-block selected' : 'book-block'}
      onClick={() => onSelect()}
      data-dragging={isDragging}
    >
      {mode === 'edit' ? (
        <div className="block-toolbar">
          <span className="block-tag">{getBlockLabel(block.type)}</span>
          <div className="block-actions">
            <button type="button" onClick={onMoveUp} aria-label="Mover para cima">
              ↑
            </button>
            <button type="button" onClick={onMoveDown} aria-label="Mover para baixo">
              ↓
            </button>
            <button type="button" onClick={onDuplicate} aria-label="Duplicar bloco">
              Duplicar
            </button>
            <button type="button" onClick={onDelete} aria-label="Excluir bloco">
              Excluir
            </button>
            <button
              type="button"
              className="drag-handle"
              aria-label="Arrastar para reordenar"
              {...attributes}
              {...listeners}
            >
              Arrastar
            </button>
          </div>
        </div>
      ) : null}

      <div className="block-main-content">
        {showInlineEditor ? (
          <BlockInlineEditRenderer
            block={block}
            onChange={onChange}
            allBlocks={allBlocks}
            onCreateQuizAttachment={onCreateQuizAttachment}
            onUpdateQuizAttachment={onUpdateQuizAttachment}
            onMoveQuizAttachmentToRoot={onMoveQuizAttachmentToRoot}
          />
        ) : (
          <BlockViewRenderer block={block} allBlocks={allBlocks} />
        )}
      </div>
    </article>
  )
}
