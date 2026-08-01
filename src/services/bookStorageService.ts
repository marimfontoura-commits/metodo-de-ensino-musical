import type { Book, BookBlock } from '../models/book'
import { createBlockByType } from '../components/blocks/registry'
import { IMAGE_BLOCK_TYPE, type ImageBlockData } from '../components/blocks/ImageBlock'
import {
  QUIZ_BLOCK_TYPE,
  normalizeQuizContent,
  normalizeQuizSettings,
} from '../components/blocks/QuizBlock'
import { hasRenderableImage } from '../components/blocks/imageSource'
import type { ContentWidth } from '../models/layoutOptions'

const STORAGE_KEY = 'interactive-book-editor:v1'

export function saveBook(book: Book): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(book))
}

export function loadBook(): Book | null {
  const rawValue = localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as Book
  } catch {
    return null
  }
}

function questionWidth(size: string): ContentWidth {
  if (size === 'small') return 'small'
  if (size === 'large') return 'large'
  if (size === 'full') return 'full'
  return 'medium'
}

function optionWidth(size: string): ContentWidth {
  if (size === 'compact') return 'small'
  if (size === 'large') return 'large'
  return 'medium'
}

function legacyImageBlock(content: ImageBlockData['content'], width: ContentWidth, fit: 'contain' | 'cover') {
  const created = createBlockByType(IMAGE_BLOCK_TYPE) as ImageBlockData
  return {
    ...created,
    content,
    settings: {
      ...created.settings,
      width,
      fit,
    },
  }
}

export function migrateLegacyQuizImages(book: Book): Book {
  const createdBlocks: BookBlock[] = []
  let changed = false

  const migratedBlocks = book.blocks.map((block) => {
    if (block.type !== QUIZ_BLOCK_TYPE) {
      return block
    }

    const content = normalizeQuizContent(block.content)
    const settings = normalizeQuizSettings(block.settings)
    let blockChanged = JSON.stringify(block.content) !== JSON.stringify(content)
    let questionBlockId = content.promptBlockId
    let questionImage: typeof content.questionImage | undefined = content.questionImage

    if (!questionBlockId && hasRenderableImage(questionImage)) {
      const imageBlock = legacyImageBlock(questionImage, questionWidth(settings.questionImageSize), 'contain')
      createdBlocks.push(imageBlock)
      questionBlockId = imageBlock.id
      questionImage = undefined
      blockChanged = true
      changed = true
    }

    const options = content.options.map((option) => {
      if (option.blockId || !hasRenderableImage(option.image)) {
        return option
      }

      const imageBlock = legacyImageBlock(option.image, optionWidth(settings.optionImageSize), settings.optionImageFit)
      createdBlocks.push(imageBlock)
      blockChanged = true
      changed = true
      return {
        ...option,
        image: undefined,
        blockId: imageBlock.id,
      }
    })

    if (!blockChanged && questionBlockId === content.promptBlockId && options.every((option, index) => option === content.options[index])) {
      return block
    }

    changed = true

    return {
      ...block,
      content: {
        ...content,
        questionImage,
        promptBlockId: questionBlockId,
        questionBlockId,
        options,
      },
    }
  })

  return changed ? { ...book, blocks: [...migratedBlocks, ...createdBlocks] } : book
}
