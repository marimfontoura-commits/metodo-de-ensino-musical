import { arrayMove } from '@dnd-kit/sortable'
import type { Book, BookBlock } from '../models/book'
import { duplicateBlock } from './bookFactory'

export function updateBlock(book: Book, blockId: string, nextBlock: BookBlock): Book {
  return {
    ...book,
    blocks: book.blocks.map((block) => (block.id === blockId ? nextBlock : block)),
  }
}

export function removeBlock(book: Book, blockId: string): Book {
  return {
    ...book,
    blocks: book.blocks.filter((block) => block.id !== blockId),
  }
}

export function insertBlock(book: Book, block: BookBlock): Book {
  return {
    ...book,
    blocks: [...book.blocks, block],
  }
}

export function cloneBlock(book: Book, blockId: string): Book {
  const index = book.blocks.findIndex((block) => block.id === blockId)
  if (index === -1) {
    return book
  }

  const copy = duplicateBlock(book.blocks[index])
  const nextBlocks = [...book.blocks]
  nextBlocks.splice(index + 1, 0, copy)

  return {
    ...book,
    blocks: nextBlocks,
  }
}

export function moveBlockUp(book: Book, blockId: string): Book {
  const index = book.blocks.findIndex((block) => block.id === blockId)
  if (index <= 0) {
    return book
  }

  return {
    ...book,
    blocks: arrayMove(book.blocks, index, index - 1),
  }
}

export function moveBlockDown(book: Book, blockId: string): Book {
  const index = book.blocks.findIndex((block) => block.id === blockId)
  if (index === -1 || index >= book.blocks.length - 1) {
    return book
  }

  return {
    ...book,
    blocks: arrayMove(book.blocks, index, index + 1),
  }
}

export function reorderBlocks(book: Book, activeId: string, overId: string): Book {
  const oldIndex = book.blocks.findIndex((block) => block.id === activeId)
  const newIndex = book.blocks.findIndex((block) => block.id === overId)

  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return book
  }

  return {
    ...book,
    blocks: arrayMove(book.blocks, oldIndex, newIndex),
  }
}
