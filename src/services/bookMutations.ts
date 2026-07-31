import { arrayMove } from '@dnd-kit/sortable'
import type { Book, BookBlock } from '../models/book'
import { canBlockAttachToQuiz } from '../components/blocks/registry'
import { QUIZ_BLOCK_TYPE, normalizeQuizContent, normalizeQuizOptionList } from '../components/blocks/QuizBlock'
import { detachBlockFromAllQuizSlots, getRootBlocks } from '../components/blocks/quizAttachmentSlots'
import { duplicateBlock } from './bookFactory'

interface QuizQuestionTarget {
  kind: 'question'
  quizBlockId: string
}

interface QuizOptionTarget {
  kind: 'option'
  quizBlockId: string
  optionId: string
}

export type QuizAttachmentTarget = QuizQuestionTarget | QuizOptionTarget

function reorderRootBlockSequence(blocks: BookBlock[], orderedRootIds: string[]): BookBlock[] {
  const orderedRoots = orderedRootIds
    .map((id) => blocks.find((block) => block.id === id))
    .filter((block): block is BookBlock => Boolean(block))
  const rootIdSet = new Set(orderedRootIds)
  let cursor = 0

  return blocks.map((block) => {
    if (!rootIdSet.has(block.id)) {
      return block
    }

    const replacement = orderedRoots[cursor]
    cursor += 1
    return replacement ?? block
  })
}

function getQuizSlotOccupantId(blocks: BookBlock[], target: QuizAttachmentTarget): string | undefined {
  const quizBlock = blocks.find((block) => block.id === target.quizBlockId && block.type === QUIZ_BLOCK_TYPE)
  if (!quizBlock) {
    return undefined
  }

  const content = normalizeQuizContent(quizBlock.content)
  if (target.kind === 'question') {
    return content.questionBlockId
  }

  return content.options.find((option) => option.id === target.optionId)?.blockId
}

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
  const rootBlocks = getRootBlocks(book.blocks)
  const index = rootBlocks.findIndex((block) => block.id === blockId)
  if (index <= 0) {
    return book
  }

  const reorderedRootIds = arrayMove(rootBlocks.map((block) => block.id), index, index - 1)

  return {
    ...book,
    blocks: reorderRootBlockSequence(book.blocks, reorderedRootIds),
  }
}

export function moveBlockDown(book: Book, blockId: string): Book {
  const rootBlocks = getRootBlocks(book.blocks)
  const index = rootBlocks.findIndex((block) => block.id === blockId)
  if (index === -1 || index >= rootBlocks.length - 1) {
    return book
  }

  const reorderedRootIds = arrayMove(rootBlocks.map((block) => block.id), index, index + 1)

  return {
    ...book,
    blocks: reorderRootBlockSequence(book.blocks, reorderedRootIds),
  }
}

export function reorderBlocks(book: Book, activeId: string, overId: string): Book {
  const rootBlocks = getRootBlocks(book.blocks)
  const oldIndex = rootBlocks.findIndex((block) => block.id === activeId)
  const newIndex = rootBlocks.findIndex((block) => block.id === overId)

  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return book
  }

  const reorderedRootIds = arrayMove(rootBlocks.map((block) => block.id), oldIndex, newIndex)

  return {
    ...book,
    blocks: reorderRootBlockSequence(book.blocks, reorderedRootIds),
  }
}

export function attachBlockToQuizSlot(book: Book, blockId: string, target: QuizAttachmentTarget): Book {
  const sourceBlock = book.blocks.find((block) => block.id === blockId)
  if (!sourceBlock || !canBlockAttachToQuiz(sourceBlock.type)) {
    return book
  }

  const slotOccupant = getQuizSlotOccupantId(book.blocks, target)
  if (slotOccupant && slotOccupant !== blockId) {
    return book
  }

  const detachedBlocks = detachBlockFromAllQuizSlots(book.blocks, blockId)
  const nextBlocks = detachedBlocks.map((block) => {
    if (block.id !== target.quizBlockId || block.type !== QUIZ_BLOCK_TYPE) {
      return block
    }

    const content = normalizeQuizContent(block.content)

    if (target.kind === 'question') {
      return {
        ...block,
        content: {
          ...content,
          questionBlockId: blockId,
        },
      }
    }

    const optionExists = content.options.some((option) => option.id === target.optionId)
    if (!optionExists) {
      return block
    }

    const nextOptions = content.options.map((option) =>
      option.id === target.optionId
        ? {
            ...option,
            blockId,
          }
        : option,
    )

    return {
      ...block,
      content: {
        ...content,
        options: normalizeQuizOptionList(nextOptions),
      },
    }
  })

  return {
    ...book,
    blocks: nextBlocks,
  }
}

export function moveAttachedBlockToRoot(book: Book, blockId: string, overRootBlockId?: string): Book {
  const detachedBlocks = detachBlockFromAllQuizSlots(book.blocks, blockId)
  const rootBlocks = getRootBlocks(detachedBlocks)
  const blockExistsInRoot = rootBlocks.some((block) => block.id === blockId)
  if (!blockExistsInRoot) {
    return {
      ...book,
      blocks: detachedBlocks,
    }
  }

  const rootIdsWithoutBlock = rootBlocks.map((block) => block.id).filter((id) => id !== blockId)
  const overIndex =
    typeof overRootBlockId === 'string' ? rootIdsWithoutBlock.findIndex((id) => id === overRootBlockId) : -1

  const reorderedRootIds = [...rootIdsWithoutBlock]
  if (overIndex >= 0) {
    reorderedRootIds.splice(overIndex, 0, blockId)
  } else {
    reorderedRootIds.push(blockId)
  }

  return {
    ...book,
    blocks: reorderRootBlockSequence(detachedBlocks, reorderedRootIds),
  }
}
