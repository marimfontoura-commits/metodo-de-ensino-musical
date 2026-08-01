import type { BookBlock } from '../../models/book'
import { QUIZ_BLOCK_TYPE } from './QuizBlock'
import { canBlockAttachToQuiz, canBlockBeInteractiveResponse } from './registry'

function toAttachmentId(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function readQuizAttachmentIds(content: unknown): Array<{ id: string; response: boolean }> {
  const rawContent = (content ?? {}) as {
    promptBlockId?: unknown
    questionBlockId?: unknown
    responseBlockId?: unknown
    options?: unknown
  }

  const ids: Array<{ id: string; response: boolean }> = []
  const questionBlockId = toAttachmentId(rawContent.promptBlockId) ?? toAttachmentId(rawContent.questionBlockId)
  if (questionBlockId) {
    ids.push({ id: questionBlockId, response: false })
  }

  const responseBlockId = toAttachmentId(rawContent.responseBlockId)
  if (responseBlockId) {
    ids.push({ id: responseBlockId, response: true })
  }

  const rawOptions = Array.isArray(rawContent.options) ? rawContent.options : []
  rawOptions.forEach((option) => {
    const rawOption = (option ?? {}) as { blockId?: unknown }
    const optionBlockId = toAttachmentId(rawOption.blockId)
    if (optionBlockId) {
      ids.push({ id: optionBlockId, response: false })
    }
  })

  return ids
}

function isValidQuizAttachmentTarget(block: BookBlock | undefined, response: boolean): block is BookBlock {
  if (!block) {
    return false
  }

  return response ? canBlockBeInteractiveResponse(block.type) : canBlockAttachToQuiz(block.type)
}

export function getQuizAttachedBlockIds(blocks: BookBlock[]): Set<string> {
  const allBlocksById = new Map(blocks.map((block) => [block.id, block]))
  const attached = new Set<string>()

  blocks.forEach((block) => {
    if (block.type !== QUIZ_BLOCK_TYPE) {
      return
    }

    const attachmentIds = readQuizAttachmentIds(block.content)
    attachmentIds.forEach((attachment) => {
      const target = allBlocksById.get(attachment.id)
      if (isValidQuizAttachmentTarget(target, attachment.response)) {
        attached.add(attachment.id)
      }
    })
  })

  return attached
}

export const getQuestionAttachedBlockIds = getQuizAttachedBlockIds

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
      promptBlockId?: unknown
      responseBlockId?: unknown
      options?: unknown
      [key: string]: unknown
    }

    let changed = false
    const nextContent: {
      questionBlockId?: unknown
      promptBlockId?: unknown
      responseBlockId?: unknown
      options?: unknown
      [key: string]: unknown
    } = { ...rawContent }

    if (
      toAttachmentId(rawContent.promptBlockId) === targetId ||
      toAttachmentId(rawContent.questionBlockId) === targetId
    ) {
      nextContent.promptBlockId = undefined
      nextContent.questionBlockId = undefined
      changed = true
    }

    if (toAttachmentId(rawContent.responseBlockId) === targetId) {
      nextContent.responseBlockId = undefined
      changed = true
    }

    const rawOptions = Array.isArray(rawContent.options) ? rawContent.options : []
    const nextOptions = rawOptions.map((option) => {
      const rawOption = (option ?? {}) as { blockId?: unknown; [key: string]: unknown }
      if (toAttachmentId(rawOption.blockId) !== targetId) {
        return option
      }

      const rest = { ...rawOption }
      delete rest.blockId
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

export const detachBlockFromAllQuestionSlots = detachBlockFromAllQuizSlots
