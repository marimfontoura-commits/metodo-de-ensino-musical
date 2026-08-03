import type { BookBlock } from '../../../models/book'
import {
  hasRenderableImage,
  normalizeImageSourceContent,
  type ImageSourceContent,
  type NormalizedImageSourceContent,
} from '../imageSource'

export const QUIZ_BLOCK_TYPE = 'quiz' as const
export type QuestionType = 'multiple-choice' | 'open-response' | 'interactive-response'
export type OpenResponseComparisonMode = 'exact' | 'normalized'

export interface OpenResponseConfig {
  placeholder?: string
  expectedAnswer?: string
  comparisonMode?: OpenResponseComparisonMode
  maxLength?: number
}

export interface NormalizedOpenResponseConfig {
  placeholder: string
  expectedAnswer: string
  comparisonMode: OpenResponseComparisonMode
  maxLength?: number
}

export interface QuizOption {
  id: string
  text?: string
  image?: ImageSourceContent
  blockId?: string
}

export interface NormalizedQuizOption {
  id: string
  text: string
  image: NormalizedImageSourceContent
  blockId?: string
}

export interface QuizBlockContent {
  questionType?: QuestionType
  prompt?: string
  question: string
  promptBlockId?: string
  questionImage?: ImageSourceContent
  questionBlockId?: string
  responseBlockId?: string
  openResponseConfig?: OpenResponseConfig
  options: QuizOption[]
  correctOptionId: string
  successFeedback: string
  errorFeedback: string
}

export interface NormalizedQuizBlockContent {
  questionType: QuestionType
  prompt: string
  question: string
  promptBlockId?: string
  questionImage: NormalizedImageSourceContent
  questionBlockId?: string
  responseBlockId?: string
  openResponseConfig: NormalizedOpenResponseConfig
  options: NormalizedQuizOption[]
  correctOptionId: string
  successFeedback: string
  errorFeedback: string
}

export type QuizQuestionImageSize = 'small' | 'medium' | 'large' | 'full'
export type QuizOptionImageSize = 'compact' | 'medium' | 'large'
export type QuizOptionImageFit = 'contain' | 'cover'

export interface QuizBlockSettings {
  questionImageSize?: QuizQuestionImageSize
  optionImageSize?: QuizOptionImageSize
  optionImageFit?: QuizOptionImageFit
}

export interface NormalizedQuizBlockSettings {
  questionImageSize: QuizQuestionImageSize
  optionImageSize: QuizOptionImageSize
  optionImageFit: QuizOptionImageFit
}

export interface QuizBlockData extends BookBlock {
  type: typeof QUIZ_BLOCK_TYPE
  content: QuizBlockContent
  settings: QuizBlockSettings
}

function normalizeAttachmentBlockId(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export const DEFAULT_QUIZ_SETTINGS: NormalizedQuizBlockSettings = {
  questionImageSize: 'medium',
  optionImageSize: 'medium',
  optionImageFit: 'contain',
}

const QUIZ_MIN_OPTIONS = 2
const QUIZ_MAX_OPTIONS = 4

function toLegacyOptionId(index: number): string {
  return `legacy-option-${index + 1}`
}

export function normalizeQuizOptions(value: unknown): QuizOption[] {
  const rawOptions = Array.isArray(value) ? value : []

  const normalized = rawOptions
    .map((item, index) => {
      const raw = (item ?? {}) as Partial<QuizOption>
      const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id : toLegacyOptionId(index)
      const text = typeof raw.text === 'string' ? raw.text : ''
      const image = normalizeImageSourceContent(raw.image)

      if (!text.trim() && !hasRenderableImage(image)) {
        return {
          id,
          text: `Alternativa ${String.fromCharCode(65 + index)}`,
          image,
          blockId: normalizeAttachmentBlockId(raw.blockId),
        }
      }

      return { id, text, image, blockId: normalizeAttachmentBlockId(raw.blockId) }
    })
    .filter((item) => item.id)
    .slice(0, QUIZ_MAX_OPTIONS)

  if (normalized.length >= QUIZ_MIN_OPTIONS) {
    return normalized
  }

  const filled = [...normalized]
  for (let i = normalized.length; i < QUIZ_MIN_OPTIONS; i += 1) {
    filled.push({
      id: toLegacyOptionId(i),
      text: `Alternativa ${String.fromCharCode(65 + i)}`,
      image: normalizeImageSourceContent(undefined),
      blockId: undefined,
    })
  }

  return filled
}

export function normalizeQuizOption(option: QuizOption, index: number): NormalizedQuizOption {
  const image = normalizeImageSourceContent(option.image)
  const rawText = typeof option.text === 'string' ? option.text : ''
  const text = !rawText.trim() && !hasRenderableImage(image)
    ? `Alternativa ${String.fromCharCode(65 + index)}`
    : rawText

  return {
    id: option.id,
    text,
    image,
    blockId: normalizeAttachmentBlockId(option.blockId),
  }
}

export function normalizeQuizOptionList(options: QuizOption[]): NormalizedQuizOption[] {
  return options.map((option, index) => normalizeQuizOption(option, index))
}

export function normalizeQuizContent(value: unknown): NormalizedQuizBlockContent {
  const raw = (value ?? {}) as Partial<QuizBlockContent>
  const options = normalizeQuizOptionList(normalizeQuizOptions(raw.options))
  const validCorrectId =
    typeof raw.correctOptionId === 'string' && options.some((option) => option.id === raw.correctOptionId)
      ? raw.correctOptionId
      : options[0].id

  const questionType: QuestionType =
    raw.questionType === 'open-response' || raw.questionType === 'interactive-response'
      ? raw.questionType
      : 'multiple-choice'
  const prompt = typeof raw.prompt === 'string'
    ? raw.prompt
    : typeof raw.question === 'string'
      ? raw.question
      : 'Novo enunciado'
  const promptBlockId = normalizeAttachmentBlockId(raw.promptBlockId) ?? normalizeAttachmentBlockId(raw.questionBlockId)
  const rawOpen = (raw.openResponseConfig ?? {}) as OpenResponseConfig
  const rawMaxLength = Number(rawOpen.maxLength)

  return {
    questionType,
    prompt,
    question: prompt,
    promptBlockId,
    questionImage: normalizeImageSourceContent(raw.questionImage),
    questionBlockId: promptBlockId,
    responseBlockId: normalizeAttachmentBlockId(raw.responseBlockId),
    openResponseConfig: {
      placeholder: typeof rawOpen.placeholder === 'string' ? rawOpen.placeholder : 'Digite sua resposta',
      expectedAnswer: typeof rawOpen.expectedAnswer === 'string' ? rawOpen.expectedAnswer : '',
      comparisonMode: rawOpen.comparisonMode === 'normalized' ? 'normalized' : 'exact',
      maxLength: Number.isFinite(rawMaxLength) && rawMaxLength > 0 ? Math.floor(rawMaxLength) : undefined,
    },
    options,
    correctOptionId: validCorrectId,
    successFeedback:
      typeof raw.successFeedback === 'string' ? raw.successFeedback : 'Resposta correta! Muito bem.',
    errorFeedback:
      typeof raw.errorFeedback === 'string' ? raw.errorFeedback : 'Resposta incorreta. Tente novamente.',
  }
}

export const QUIZ_LIMITS = {
  minOptions: QUIZ_MIN_OPTIONS,
  maxOptions: QUIZ_MAX_OPTIONS,
} as const

export function getQuizOptionLabel(option: NormalizedQuizOption, index: number): string {
  if (option.text.trim()) {
    return option.text
  }

  if (option.image.alt.trim()) {
    return option.image.alt
  }

  return `Alternativa ${index + 1}`
}

export function normalizeQuizSettings(value: unknown): NormalizedQuizBlockSettings {
  const raw = (value ?? {}) as Partial<QuizBlockSettings>

  return {
    questionImageSize:
      raw.questionImageSize === 'small' ||
      raw.questionImageSize === 'medium' ||
      raw.questionImageSize === 'large' ||
      raw.questionImageSize === 'full'
        ? raw.questionImageSize
        : DEFAULT_QUIZ_SETTINGS.questionImageSize,
    optionImageSize:
      raw.optionImageSize === 'compact' || raw.optionImageSize === 'medium' || raw.optionImageSize === 'large'
        ? raw.optionImageSize
        : DEFAULT_QUIZ_SETTINGS.optionImageSize,
    optionImageFit:
      raw.optionImageFit === 'contain' || raw.optionImageFit === 'cover'
        ? raw.optionImageFit
        : DEFAULT_QUIZ_SETTINGS.optionImageFit,
  }
}
