import type { ComponentType, ReactElement } from 'react'
import type { BookBlock } from '../../models/book'

export type BlockEmbedMode = 'static' | 'interactive'

export interface BlockCapabilities {
  embeddable?: boolean
  embedMode?: BlockEmbedMode
  canAttachToQuiz?: boolean
  canAttachToQuestion?: boolean
  canBeInteractiveResponse?: boolean
  // Embedded content is always a leaf and cannot embed other blocks.
  isLeafContentOnly?: true
}

export interface QuizAttachableBlockOption {
  type: string
  name: string
  icon: string
}

export interface InteractiveResponseResult {
  isCorrect: boolean
  isComplete: boolean
  missingCount?: number
  extraCount?: number
}

export interface InteractiveResponseStatus {
  isComplete: boolean
  canSubmit: boolean
  message?: string
}

export interface InteractiveResponseController {
  evaluate: () => InteractiveResponseResult
  reset: () => void
}

export interface InteractiveResponseComponentProps {
  block: BookBlock
  locked: boolean
  onControllerReady: (controller: InteractiveResponseController | null) => void
  onStatusChange: (status: InteractiveResponseStatus) => void
}

export type QuizAttachmentTarget =
  | { kind: 'question'; quizBlockId: string }
  | { kind: 'option'; quizBlockId: string; optionId: string }
  | { kind: 'response'; quizBlockId: string }

export interface BlockEditComponentProps {
  block: BookBlock
  onChange: (next: BookBlock) => void
  allBlocks?: BookBlock[]
  renderQuizAttachment?: (blockId: string) => ReactElement | null
  renderQuizAttachmentEditor?: (
    block: BookBlock,
    onChange: (next: BookBlock) => void,
  ) => ReactElement | null
  quizAttachableBlockOptions?: QuizAttachableBlockOption[]
  interactiveResponseBlockOptions?: QuizAttachableBlockOption[]
  onCreateQuizAttachment?: (type: string, target: QuizAttachmentTarget) => BookBlock | null
  onUpdateQuizAttachment?: (blockId: string, next: BookBlock) => void
  onMoveQuizAttachmentToRoot?: (blockId: string, quizBlockId: string) => void
}

export interface BlockViewComponentProps {
  block: BookBlock
  allBlocks?: BookBlock[]
  renderQuizAttachment?: (blockId: string) => ReactElement | null
  renderInteractiveResponse?: (
    blockId: string,
    props: Omit<InteractiveResponseComponentProps, 'block'>,
  ) => ReactElement | null
}

export interface BlockDefinition {
  id: string
  name: string
  icon: string
  capabilities?: BlockCapabilities
  ViewComponent: ComponentType<BlockViewComponentProps>
  QuizAttachmentComponent?: ComponentType<BlockViewComponentProps>
  QuizAttachmentEditComponent?: ComponentType<BlockEditComponentProps>
  InteractiveResponseComponent?: ComponentType<InteractiveResponseComponentProps>
  isInteractiveResponseValid?: (block: BookBlock) => boolean
  InlineEditComponent?: ComponentType<BlockEditComponentProps>
  PropertiesComponent?: ComponentType<BlockEditComponentProps>
  create: () => BookBlock
}
