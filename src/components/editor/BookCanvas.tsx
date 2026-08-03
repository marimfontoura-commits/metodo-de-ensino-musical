import {
  DndContext,
  PointerSensor,
  useDroppable,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Book, BookBlock, EditorMode } from '../../models/book'
import type { BlockEditComponentProps } from '../blocks/types'
import { canBlockAttachToQuiz } from '../blocks/registry'
import { QUIZ_BLOCK_TYPE, normalizeQuizContent } from '../blocks/QuizBlock'
import {
  ROOT_DROP_ZONE_ID,
  parseQuizDropTarget,
  type QuizDropTarget,
} from '../blocks/QuizBlock/quizAttachmentDnd'
import { getRootBlocks } from '../blocks/quizAttachmentSlots'
import { SortableBlockItem } from './SortableBlockItem'
import { BookTitleBanner } from './BookTitleBanner'
import '../../styles/editor.css'

interface BookCanvasProps {
  book: Book
  mode: EditorMode
  selectedBlockId: string | null
  onSelectBlock: (blockId: string) => void
  onClearSelection: () => void
  onUpdateBlock: (blockId: string, block: BookBlock) => void
  onUpdateTitle: (nextTitle: string) => void
  onDuplicateBlock: (blockId: string) => void
  onDeleteBlock: (blockId: string) => void
  onMoveBlockUp: (blockId: string) => void
  onMoveBlockDown: (blockId: string) => void
  onReorderBlocks: (activeId: string, overId: string) => void
  onAttachBlockToQuizSlot: (blockId: string, target: QuizDropTarget) => void
  onMoveAttachedBlockToRoot: (blockId: string, overRootBlockId?: string) => void
  onCreateQuizAttachment: NonNullable<BlockEditComponentProps['onCreateQuizAttachment']>
  onMoveQuizAttachmentToRoot: NonNullable<BlockEditComponentProps['onMoveQuizAttachmentToRoot']>
}

export function BookCanvas({
  book,
  mode,
  selectedBlockId,
  onSelectBlock,
  onClearSelection,
  onUpdateBlock,
  onUpdateTitle,
  onDuplicateBlock,
  onDeleteBlock,
  onMoveBlockUp,
  onMoveBlockDown,
  onReorderBlocks,
  onAttachBlockToQuizSlot,
  onMoveAttachedBlockToRoot,
  onCreateQuizAttachment,
  onMoveQuizAttachmentToRoot,
}: BookCanvasProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const rootBlocks = getRootBlocks(book.blocks)
  const { setNodeRef: setRootDropRef } = useDroppable({
    id: ROOT_DROP_ZONE_ID,
    data: {
      kind: 'root-drop-zone',
    },
  })

  function getQuizSlotOccupant(target: QuizDropTarget): string | undefined {
    const quizBlock = book.blocks.find((block) => block.id === target.quizBlockId && block.type === QUIZ_BLOCK_TYPE)
    if (!quizBlock) {
      return undefined
    }

    const content = normalizeQuizContent(quizBlock.content)
    if (target.kind === 'question') {
      return content.promptBlockId
    }

    return content.options.find((option) => option.id === target.optionId)?.blockId
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) {
      return
    }

    const activeId = String(active.id)
    const overId = String(over.id)
    const activeBlock = book.blocks.find((block) => block.id === activeId)
    if (!activeBlock) {
      return
    }

    const overQuizTarget = parseQuizDropTarget(overId)
    if (overQuizTarget) {
      if (!canBlockAttachToQuiz(activeBlock.type)) {
        return
      }

      const occupant = getQuizSlotOccupant(overQuizTarget)
      if (occupant && occupant !== activeId) {
        return
      }

      onAttachBlockToQuizSlot(activeId, overQuizTarget)
      return
    }

    if (overId === ROOT_DROP_ZONE_ID) {
      onMoveAttachedBlockToRoot(activeId)
      return
    }

    if (activeId === overId) {
      return
    }

    const overIsRootBlock = rootBlocks.some((block) => block.id === overId)
    if (!overIsRootBlock) {
      return
    }

    const activeIsRootBlock = rootBlocks.some((block) => block.id === activeId)
    if (activeIsRootBlock) {
      onReorderBlocks(activeId, overId)
      return
    }

    onMoveAttachedBlockToRoot(activeId, overId)
  }

  return (
    <main
      className="book-column"
      aria-label="Area do livro"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClearSelection()
        }
      }}
    >
      <BookTitleBanner
        title={book.title}
        editable={mode === 'edit'}
        onChangeTitle={onUpdateTitle}
        onFocusTitle={onClearSelection}
      />
      {rootBlocks.length === 0 ? <p className="empty-state">Adicione blocos no painel lateral.</p> : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rootBlocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
          <div
            className="blocks-list"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onClearSelection()
              }
            }}
          >
            {rootBlocks.map((block) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                allBlocks={book.blocks}
                mode={mode}
                isSelected={selectedBlockId === block.id}
                onSelect={() => onSelectBlock(block.id)}
                onChange={(next) => onUpdateBlock(block.id, next)}
                onDuplicate={() => onDuplicateBlock(block.id)}
                onDelete={() => onDeleteBlock(block.id)}
                onMoveUp={() => onMoveBlockUp(block.id)}
                onMoveDown={() => onMoveBlockDown(block.id)}
                onCreateQuizAttachment={onCreateQuizAttachment}
                onUpdateQuizAttachment={onUpdateBlock}
                onMoveQuizAttachmentToRoot={onMoveQuizAttachmentToRoot}
              />
            ))}

            <div
              ref={setRootDropRef}
              className="root-drop-marker"
              aria-label="Area para soltar bloco na raiz"
            />
          </div>
        </SortableContext>
      </DndContext>
    </main>
  )
}
