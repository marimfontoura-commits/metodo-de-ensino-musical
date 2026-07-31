import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { TopBar, SidePanel, BookCanvas, BookReader, PropertiesInspector } from './components/editor'
import type { BlockType, Book, BookBlock, EditorMode } from './models/book'
import { createInitialBook, createNewBlock } from './services/bookFactory'
import {
  attachBlockToQuizSlot,
  cloneBlock,
  insertBlock,
  moveAttachedBlockToRoot,
  moveBlockDown,
  moveBlockUp,
  removeBlock,
  reorderBlocks,
  updateBlock,
} from './services/bookMutations'
import type { QuizDropTarget } from './components/blocks/QuizBlock/quizAttachmentDnd'
import { loadBook, saveBook } from './services/bookStorageService'

function App() {
  const [book, setBook] = useState<Book>(() => loadBook() ?? createInitialBook())
  const [mode, setMode] = useState<EditorMode>('edit')
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  useEffect(() => {
    saveBook(book)
  }, [book])

  const selectedIndex = useMemo(
    () => book.blocks.findIndex((block) => block.id === selectedBlockId),
    [book.blocks, selectedBlockId],
  )

  const selectedBlock = useMemo(
    () => book.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [book.blocks, selectedBlockId],
  )

  function handleAddBlock(type: BlockType) {
    const nextBlock = createNewBlock(type)
    setBook((current) => insertBlock(current, nextBlock))
    setSelectedBlockId(nextBlock.id)
  }

  function handleUpdateBlock(blockId: string, nextBlock: BookBlock) {
    setBook((current) => updateBlock(current, blockId, nextBlock))
  }

  function handleDuplicateBlock(blockId: string) {
    setBook((current) => cloneBlock(current, blockId))
  }

  function handleDeleteBlock(blockId: string) {
    setBook((current) => removeBlock(current, blockId))
    setSelectedBlockId((current) => (current === blockId ? null : current))
  }

  function handleMoveBlockUp(blockId: string) {
    setBook((current) => moveBlockUp(current, blockId))
  }

  function handleMoveBlockDown(blockId: string) {
    setBook((current) => moveBlockDown(current, blockId))
  }

  function handleReorderBlocks(activeId: string, overId: string) {
    setBook((current) => reorderBlocks(current, activeId, overId))
  }

  function handleAttachBlockToQuizSlot(blockId: string, target: QuizDropTarget) {
    setBook((current) => attachBlockToQuizSlot(current, blockId, target))
  }

  function handleMoveAttachedBlockToRoot(blockId: string, overRootBlockId?: string) {
    setBook((current) => moveAttachedBlockToRoot(current, blockId, overRootBlockId))
  }

  return (
    <div className="editor-shell">
      <TopBar mode={mode} onSetMode={setMode} />

      {mode === 'edit' ? (
        <div className="editor-layout edit-mode-with-inspector">
          <SidePanel onAddBlock={handleAddBlock} />

          <section className="editor-content">
            <div className="book-meta">
              <span>
                {selectedIndex >= 0
                  ? `Bloco selecionado: ${selectedIndex + 1}`
                  : 'Nenhum bloco selecionado'}
              </span>
            </div>

            <BookCanvas
              book={book}
              mode="edit"
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onClearSelection={() => setSelectedBlockId(null)}
              onUpdateBlock={handleUpdateBlock}
              onUpdateTitle={(nextTitle) =>
                setBook((current) => ({
                  ...current,
                  title: nextTitle,
                }))
              }
              onDuplicateBlock={handleDuplicateBlock}
              onDeleteBlock={handleDeleteBlock}
              onMoveBlockUp={handleMoveBlockUp}
              onMoveBlockDown={handleMoveBlockDown}
              onReorderBlocks={handleReorderBlocks}
              onAttachBlockToQuizSlot={handleAttachBlockToQuizSlot}
              onMoveAttachedBlockToRoot={handleMoveAttachedBlockToRoot}
            />
          </section>

          <PropertiesInspector
            selectedBlock={selectedBlock}
            onChangeBlock={handleUpdateBlock}
          />
        </div>
      ) : (
        <div className="reader-layout">
          <BookReader book={book} />
        </div>
      )}
    </div>
  )
}

export default App
