import type { ComponentType, ReactElement } from 'react'
import type { BookBlock } from '../../models/book'

export type BlockEmbedMode = 'static' | 'interactive'

export interface BlockCapabilities {
  embeddable?: boolean
  embedMode?: BlockEmbedMode
  canAttachToQuiz?: boolean
  // Embedded content is always a leaf and cannot embed other blocks.
  isLeafContentOnly?: true
}

export interface BlockEditComponentProps {
  block: BookBlock
  onChange: (next: BookBlock) => void
  allBlocks?: BookBlock[]
  renderQuizAttachment?: (blockId: string) => ReactElement | null
}

export interface BlockViewComponentProps {
  block: BookBlock
  allBlocks?: BookBlock[]
  renderQuizAttachment?: (blockId: string) => ReactElement | null
}

export interface BlockDefinition {
  id: string
  name: string
  icon: string
  capabilities?: BlockCapabilities
  ViewComponent: ComponentType<BlockViewComponentProps>
  QuizAttachmentComponent?: ComponentType<BlockViewComponentProps>
  InlineEditComponent?: ComponentType<BlockEditComponentProps>
  PropertiesComponent?: ComponentType<BlockEditComponentProps>
  create: () => BookBlock
}
