import {
  DndContext,
  PointerSensor,
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
}: BookCanvasProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    onReorderBlocks(String(active.id), String(over.id))
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
      <BookTitleBanner title={book.title} editable={mode === 'edit'} onChangeTitle={onUpdateTitle} />
      {book.blocks.length === 0 ? <p className="empty-state">Adicione blocos no painel lateral.</p> : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={book.blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
          <div
            className="blocks-list"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onClearSelection()
              }
            }}
          >
            {book.blocks.map((block) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                mode={mode}
                isSelected={selectedBlockId === block.id}
                onSelect={() => onSelectBlock(block.id)}
                onChange={(next) => onUpdateBlock(block.id, next)}
                onDuplicate={() => onDuplicateBlock(block.id)}
                onDelete={() => onDeleteBlock(block.id)}
                onMoveUp={() => onMoveBlockUp(block.id)}
                onMoveDown={() => onMoveBlockDown(block.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </main>
  )
}
