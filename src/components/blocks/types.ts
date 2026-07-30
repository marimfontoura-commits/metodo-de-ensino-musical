import type { ComponentType } from 'react'
import type { BookBlock } from '../../models/book'

export interface BlockEditComponentProps {
  block: BookBlock
  onChange: (next: BookBlock) => void
}

export interface BlockViewComponentProps {
  block: BookBlock
}

export interface BlockDefinition {
  id: string
  name: string
  icon: string
  ViewComponent: ComponentType<BlockViewComponentProps>
  InlineEditComponent?: ComponentType<BlockEditComponentProps>
  PropertiesComponent?: ComponentType<BlockEditComponentProps>
  create: () => BookBlock
}
