import type { BookBlock } from '../../models/book'
import { QUIZ_BLOCK_TYPE } from './QuizBlock'
import { canBlockAttachToQuiz } from './registry'

function toAttachmentId(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function readQuizAttachmentIds(content: unknown): string[] {
  const rawContent = (content ?? {}) as {
    questionBlockId?: unknown
    options?: unknown
  }

  const ids: string[] = []
  const questionBlockId = toAttachmentId(rawContent.questionBlockId)
  if (questionBlockId) {
    ids.push(questionBlockId)
  }

  const rawOptions = Array.isArray(rawContent.options) ? rawContent.options : []
  rawOptions.forEach((option) => {
    const rawOption = (option ?? {}) as { blockId?: unknown }
    const optionBlockId = toAttachmentId(rawOption.blockId)
    if (optionBlockId) {
      ids.push(optionBlockId)
    }
  })

  return ids
}

function isValidQuizAttachmentTarget(block: BookBlock | undefined): block is BookBlock {
  if (!block) {
    return false
  }

  return canBlockAttachToQuiz(block.type)
}

export function getQuizAttachedBlockIds(blocks: BookBlock[]): Set<string> {
  const allBlocksById = new Map(blocks.map((block) => [block.id, block]))
  const attached = new Set<string>()

  blocks.forEach((block) => {
    if (block.type !== QUIZ_BLOCK_TYPE) {
      return
    }

    const attachmentIds = readQuizAttachmentIds(block.content)
    attachmentIds.forEach((attachmentId) => {
      const target = allBlocksById.get(attachmentId)
      if (isValidQuizAttachmentTarget(target)) {
        attached.add(attachmentId)
      }
    })
  })

  return attached
}

export function getRootBlocks(blocks: BookBlock[]): BookBlock[] {
  const attached = getQuizAttachedBlockIds(blocks)
  return blocks.filter((block) => !attached.has(block.id))
}

export function detachBlockFromAllQuizSlots(blocks: BookBlock[], blockId: string): BookBlock[] {
  const targetId = blockId.trim()
  if (!targetId) {
    return blocks
  }

  let hasChanges = false

  const nextBlocks = blocks.map((block) => {
    if (block.type !== QUIZ_BLOCK_TYPE) {
      return block
    }

    const rawContent = (block.content ?? {}) as {
      questionBlockId?: unknown
      options?: unknown
      [key: string]: unknown
    }

    let changed = false
    const nextContent: {
      questionBlockId?: unknown
      options?: unknown
      [key: string]: unknown
    } = { ...rawContent }

    if (toAttachmentId(rawContent.questionBlockId) === targetId) {
      nextContent.questionBlockId = undefined
      changed = true
    }

    const rawOptions = Array.isArray(rawContent.options) ? rawContent.options : []
    const nextOptions = rawOptions.map((option) => {
      const rawOption = (option ?? {}) as { blockId?: unknown; [key: string]: unknown }
      if (toAttachmentId(rawOption.blockId) !== targetId) {
        return option
      }

      const { blockId: _removed, ...rest } = rawOption
      changed = true
      return rest
    })

    if (changed) {
      nextContent.options = nextOptions
      hasChanges = true
      return {
        ...block,
        content: nextContent,
      }
    }

    return block
  })

  return hasChanges ? nextBlocks : blocks
}
