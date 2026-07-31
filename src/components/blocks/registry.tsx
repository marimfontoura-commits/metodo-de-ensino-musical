import type { BookBlock, BlockType } from '../../models/book'
import type { ReactElement } from 'react'
import type {
  BlockDefinition,
  BlockEditComponentProps,
  BlockViewComponentProps,
} from './types'
import {
  HEADING_BLOCK_TYPE,
  HeadingBlockEdit,
  HeadingBlockProperties,
  HeadingBlockView,
  createHeadingBlock,
} from './HeadingBlock'
import {
  TEXT_BLOCK_TYPE,
  TextBlockEdit,
  TextBlockProperties,
  TextBlockView,
  createTextBlock,
} from './TextBlock'
import {
  IMAGE_BLOCK_TYPE,
  ImageBlockEdit,
  ImageBlockView,
  createImageBlock,
} from './ImageBlock'
import {
  QUIZ_BLOCK_TYPE,
  QuizBlockEdit,
  QuizBlockProperties,
  QuizBlockView,
  createQuizBlock,
} from './QuizBlock'
import {
  PIANO_BLOCK_TYPE,
  PianoBlockEdit,
  PianoBlockProperties,
  PianoBlockView,
  createPianoBlock,
} from './PianoBlock'

function castEdit<T extends BookBlock>(
  Component: (props: { block: T; onChange: (next: T) => void }) => ReactElement,
): (props: BlockEditComponentProps) => ReactElement {
  return ({ block, onChange }) => (
    <Component block={block as T} onChange={(next) => onChange(next)} />
  )
}

function castView<T extends BookBlock>(
  Component: (props: { block: T }) => ReactElement,
): (props: BlockViewComponentProps) => ReactElement {
  return ({ block }) => <Component block={block as T} />
}

export const BLOCK_REGISTRY: BlockDefinition[] = [
  {
    id: HEADING_BLOCK_TYPE,
    name: 'Titulo',
    icon: 'Tt',
    InlineEditComponent: castEdit(HeadingBlockEdit),
    PropertiesComponent: castEdit(HeadingBlockProperties),
    ViewComponent: castView(HeadingBlockView),
    create: () => createHeadingBlock(),
  },
  {
    id: TEXT_BLOCK_TYPE,
    name: 'Texto',
    icon: 'Tx',
    InlineEditComponent: castEdit(TextBlockEdit),
    PropertiesComponent: castEdit(TextBlockProperties),
    ViewComponent: castView(TextBlockView),
    create: () => createTextBlock(),
  },
  {
    id: IMAGE_BLOCK_TYPE,
    name: 'Imagem',
    icon: 'Im',
    PropertiesComponent: castEdit(ImageBlockEdit),
    ViewComponent: castView(ImageBlockView),
    create: () => createImageBlock(),
  },
  {
    id: QUIZ_BLOCK_TYPE,
    name: 'Quiz',
    icon: 'Qz',
    InlineEditComponent: castEdit(QuizBlockEdit),
    PropertiesComponent: castEdit(QuizBlockProperties),
    ViewComponent: castView(QuizBlockView),
    create: () => createQuizBlock(),
  },
  {
    id: PIANO_BLOCK_TYPE,
    name: 'Piano',
    icon: 'Pn',
    InlineEditComponent: castEdit(PianoBlockEdit),
    PropertiesComponent: castEdit(PianoBlockProperties),
    ViewComponent: castView(PianoBlockView),
    create: () => createPianoBlock(),
  },
]

export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return BLOCK_REGISTRY.find((block) => block.id === type)
}

export function createBlockByType(type: BlockType): BookBlock {
  const definition = getBlockDefinition(type)
  if (!definition) {
    throw new Error(`Tipo de bloco nao registrado: ${type}`)
  }

  return definition.create()
}

export function getBlockLabel(type: BlockType): string {
  return getBlockDefinition(type)?.name ?? type
}

interface BlockEditRendererProps {
  block: BookBlock
  onChange: (next: BookBlock) => void
}

export function hasInlineEditing(type: BlockType): boolean {
  return Boolean(getBlockDefinition(type)?.InlineEditComponent)
}

export function hasPropertiesEditor(type: BlockType): boolean {
  return Boolean(getBlockDefinition(type)?.PropertiesComponent)
}

export function BlockInlineEditRenderer({ block, onChange }: BlockEditRendererProps) {
  const definition = getBlockDefinition(block.type)
  if (!definition || !definition.InlineEditComponent) {
    return <p>Tipo de bloco nao suportado: {block.type}</p>
  }

  const Component = definition.InlineEditComponent
  return <Component block={block} onChange={onChange} />
}

export function BlockPropertiesRenderer({ block, onChange }: BlockEditRendererProps) {
  const definition = getBlockDefinition(block.type)
  if (!definition || !definition.PropertiesComponent) {
    return <p>Tipo de bloco nao suportado: {block.type}</p>
  }

  const Component = definition.PropertiesComponent
  return <Component block={block} onChange={onChange} />
}

interface BlockViewRendererProps {
  block: BookBlock
}

export function BlockViewRenderer({ block }: BlockViewRendererProps) {
  const definition = getBlockDefinition(block.type)
  if (!definition) {
    return <p>Tipo de bloco nao suportado: {block.type}</p>
  }

  const Component = definition.ViewComponent
  return <Component block={block} />
}
