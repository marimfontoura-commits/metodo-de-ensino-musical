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
  ImageBlockQuizAttachment,
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
  PianoBlockQuizAttachment,
  PianoBlockQuizAttachmentEdit,
  PianoBlockInteractiveResponse,
  isPianoInteractiveResponseValid,
  PianoBlockView,
  createPianoBlock,
} from './PianoBlock'

function castEdit<T extends BookBlock>(
  Component: (props: {
    block: T
    onChange: (next: T) => void
    allBlocks?: BookBlock[]
    renderQuizAttachment?: (blockId: string) => ReactElement | null
    renderQuizAttachmentEditor?: BlockEditComponentProps['renderQuizAttachmentEditor']
    quizAttachableBlockOptions?: BlockEditComponentProps['quizAttachableBlockOptions']
    interactiveResponseBlockOptions?: BlockEditComponentProps['interactiveResponseBlockOptions']
    onCreateQuizAttachment?: BlockEditComponentProps['onCreateQuizAttachment']
    onUpdateQuizAttachment?: BlockEditComponentProps['onUpdateQuizAttachment']
    onMoveQuizAttachmentToRoot?: BlockEditComponentProps['onMoveQuizAttachmentToRoot']
  }) => ReactElement,
): (props: BlockEditComponentProps) => ReactElement {
  return ({
    block,
    onChange,
    allBlocks,
    renderQuizAttachment,
    renderQuizAttachmentEditor,
    quizAttachableBlockOptions,
    interactiveResponseBlockOptions,
    onCreateQuizAttachment,
    onUpdateQuizAttachment,
    onMoveQuizAttachmentToRoot,
  }) => (
    <Component
      block={block as T}
      onChange={(next) => onChange(next)}
      allBlocks={allBlocks}
      renderQuizAttachment={renderQuizAttachment}
      renderQuizAttachmentEditor={renderQuizAttachmentEditor}
      quizAttachableBlockOptions={quizAttachableBlockOptions}
      interactiveResponseBlockOptions={interactiveResponseBlockOptions}
      onCreateQuizAttachment={onCreateQuizAttachment}
      onUpdateQuizAttachment={onUpdateQuizAttachment}
      onMoveQuizAttachmentToRoot={onMoveQuizAttachmentToRoot}
    />
  )
}

function castView<T extends BookBlock>(
  Component: (props: {
    block: T
    allBlocks?: BookBlock[]
    renderQuizAttachment?: (blockId: string) => ReactElement | null
    renderInteractiveResponse?: BlockViewComponentProps['renderInteractiveResponse']
  }) => ReactElement,
): (props: BlockViewComponentProps) => ReactElement {
  return ({ block, allBlocks, renderQuizAttachment, renderInteractiveResponse }) => (
    <Component
      block={block as T}
      allBlocks={allBlocks}
      renderQuizAttachment={renderQuizAttachment}
      renderInteractiveResponse={renderInteractiveResponse}
    />
  )
}

function castQuizAttachment<T extends BookBlock>(
  Component: (props: { block: T }) => ReactElement,
): (props: BlockViewComponentProps) => ReactElement {
  return ({ block }) => <Component block={block as T} />
}

export const BLOCK_REGISTRY: BlockDefinition[] = [
  {
    id: HEADING_BLOCK_TYPE,
    name: 'Titulo',
    icon: 'Tt',
    capabilities: {
      embeddable: false,
      canAttachToQuiz: false,
      canAttachToQuestion: false,
      canBeInteractiveResponse: false,
    },
    InlineEditComponent: castEdit(HeadingBlockEdit),
    PropertiesComponent: castEdit(HeadingBlockProperties),
    ViewComponent: castView(HeadingBlockView),
    create: () => createHeadingBlock(),
  },
  {
    id: TEXT_BLOCK_TYPE,
    name: 'Texto',
    icon: 'Tx',
    capabilities: {
      embeddable: false,
      canAttachToQuiz: false,
      canAttachToQuestion: false,
      canBeInteractiveResponse: false,
    },
    InlineEditComponent: castEdit(TextBlockEdit),
    PropertiesComponent: castEdit(TextBlockProperties),
    ViewComponent: castView(TextBlockView),
    create: () => createTextBlock(),
  },
  {
    id: IMAGE_BLOCK_TYPE,
    name: 'Imagem',
    icon: 'Im',
    capabilities: {
      embeddable: true,
      embedMode: 'static',
      canAttachToQuiz: true,
      canAttachToQuestion: true,
      canBeInteractiveResponse: false,
      isLeafContentOnly: true,
    },
  QuizAttachmentComponent: castQuizAttachment(ImageBlockQuizAttachment),
    QuizAttachmentEditComponent: castEdit(ImageBlockEdit),
    PropertiesComponent: castEdit(ImageBlockEdit),
    ViewComponent: castView(ImageBlockView),
    create: () => createImageBlock(),
  },
  {
    id: QUIZ_BLOCK_TYPE,
    name: 'Questão',
    icon: 'Qz',
    capabilities: {
      embeddable: false,
      canAttachToQuiz: false,
      canAttachToQuestion: false,
      canBeInteractiveResponse: false,
    },
    InlineEditComponent: castEdit(QuizBlockEdit),
    PropertiesComponent: castEdit(QuizBlockProperties),
    ViewComponent: castView(QuizBlockView),
    create: () => createQuizBlock(),
  },
  {
    id: PIANO_BLOCK_TYPE,
    name: 'Piano',
    icon: 'Pn',
    capabilities: {
      embeddable: true,
      embedMode: 'static',
      canAttachToQuiz: true,
      canAttachToQuestion: true,
      canBeInteractiveResponse: true,
      isLeafContentOnly: true,
    },
    QuizAttachmentComponent: castQuizAttachment(PianoBlockQuizAttachment),
    QuizAttachmentEditComponent: castEdit(PianoBlockQuizAttachmentEdit),
    InteractiveResponseComponent: PianoBlockInteractiveResponse,
    isInteractiveResponseValid: isPianoInteractiveResponseValid,
    InlineEditComponent: castEdit(PianoBlockEdit),
    PropertiesComponent: castEdit(PianoBlockProperties),
    ViewComponent: castView(PianoBlockView),
    create: () => createPianoBlock(),
  },
]

export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return BLOCK_REGISTRY.find((block) => block.id === type)
}

export function canBlockAttachToQuiz(type: BlockType): boolean {
  const definition = getBlockDefinition(type)
  return Boolean(
    (definition?.capabilities?.canAttachToQuestion || definition?.capabilities?.canAttachToQuiz) &&
    definition.QuizAttachmentComponent,
  )
}

export function canBlockBeInteractiveResponse(type: BlockType): boolean {
  const definition = getBlockDefinition(type)
  return Boolean(
    definition?.capabilities?.canBeInteractiveResponse &&
    definition.InteractiveResponseComponent &&
    definition.isInteractiveResponseValid,
  )
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
  allBlocks?: BookBlock[]
  onCreateQuizAttachment?: BlockEditComponentProps['onCreateQuizAttachment']
  onUpdateQuizAttachment?: BlockEditComponentProps['onUpdateQuizAttachment']
  onMoveQuizAttachmentToRoot?: BlockEditComponentProps['onMoveQuizAttachmentToRoot']
}

export function getQuizAttachableBlockOptions() {
  return BLOCK_REGISTRY
    .filter((definition) => definition.capabilities?.canAttachToQuestion === true)
    .map((definition) => ({ type: definition.id, name: definition.name, icon: definition.icon }))
}

export function getInteractiveResponseBlockOptions() {
  return BLOCK_REGISTRY
    .filter((definition) => definition.capabilities?.canBeInteractiveResponse === true)
    .map((definition) => ({ type: definition.id, name: definition.name, icon: definition.icon }))
}

function createQuizAttachmentEditorRenderer() {
  return (block: BookBlock, onChange: (next: BookBlock) => void): ReactElement | null => {
    const definition = getBlockDefinition(block.type)
    if (
      (!definition?.capabilities?.canAttachToQuestion && !definition?.capabilities?.canBeInteractiveResponse) ||
      !definition.QuizAttachmentEditComponent
    ) {
      return null
    }

    const Component = definition.QuizAttachmentEditComponent
    return <Component block={block} onChange={onChange} />
  }
}

function resolveQuizAttachableBlock(blockId: string, allBlocks?: BookBlock[]): BookBlock | undefined {
  if (!blockId.trim() || !allBlocks || allBlocks.length === 0) {
    return undefined
  }

  const target = allBlocks.find((candidate) => candidate.id === blockId)
  if (!target) {
    return undefined
  }

  const definition = getBlockDefinition(target.type)
  if (
    (!definition?.capabilities?.canAttachToQuestion && !definition?.capabilities?.canAttachToQuiz &&
      !definition?.capabilities?.canBeInteractiveResponse) ||
    !definition.QuizAttachmentComponent
  ) {
    return undefined
  }

  return target
}

function createQuizAttachmentRenderer(allBlocks?: BookBlock[]) {
  return (blockId: string): ReactElement | null => {
    const target = resolveQuizAttachableBlock(blockId, allBlocks)
    if (!target) {
      return null
    }

    const definition = getBlockDefinition(target.type)
    if (!definition?.QuizAttachmentComponent) {
      return null
    }

    const Component = definition.QuizAttachmentComponent
    return <Component block={target} />
  }
}

function createInteractiveResponseRenderer(allBlocks?: BookBlock[]) {
  return (
    blockId: string,
    props: Parameters<NonNullable<BlockViewComponentProps['renderInteractiveResponse']>>[1],
  ): ReactElement | null => {
    const target = allBlocks?.find((candidate) => candidate.id === blockId)
    if (!target) {
      return null
    }

    const definition = getBlockDefinition(target.type)
    if (
      !definition?.capabilities?.canBeInteractiveResponse ||
      !definition.InteractiveResponseComponent ||
      !definition.isInteractiveResponseValid?.(target)
    ) {
      return null
    }

    const Component = definition.InteractiveResponseComponent
    return <Component block={target} {...props} />
  }
}

export function hasInlineEditing(type: BlockType): boolean {
  return Boolean(getBlockDefinition(type)?.InlineEditComponent)
}

export function hasPropertiesEditor(type: BlockType): boolean {
  return Boolean(getBlockDefinition(type)?.PropertiesComponent)
}

export function BlockInlineEditRenderer({
  block,
  onChange,
  allBlocks,
  onCreateQuizAttachment,
  onUpdateQuizAttachment,
  onMoveQuizAttachmentToRoot,
}: BlockEditRendererProps) {
  const definition = getBlockDefinition(block.type)
  if (!definition || !definition.InlineEditComponent) {
    return <p>Tipo de bloco nao suportado: {block.type}</p>
  }

  const Component = definition.InlineEditComponent
  return (
    <Component
      block={block}
      onChange={onChange}
      allBlocks={allBlocks}
      renderQuizAttachment={createQuizAttachmentRenderer(allBlocks)}
      renderQuizAttachmentEditor={createQuizAttachmentEditorRenderer()}
      quizAttachableBlockOptions={getQuizAttachableBlockOptions()}
      interactiveResponseBlockOptions={getInteractiveResponseBlockOptions()}
      onCreateQuizAttachment={onCreateQuizAttachment}
      onUpdateQuizAttachment={onUpdateQuizAttachment}
      onMoveQuizAttachmentToRoot={onMoveQuizAttachmentToRoot}
    />
  )
}

export function BlockPropertiesRenderer({ block, onChange, allBlocks }: BlockEditRendererProps) {
  const definition = getBlockDefinition(block.type)
  if (!definition || !definition.PropertiesComponent) {
    return <p>Tipo de bloco nao suportado: {block.type}</p>
  }

  const Component = definition.PropertiesComponent
  return (
    <Component
      block={block}
      onChange={onChange}
      allBlocks={allBlocks}
      renderQuizAttachment={createQuizAttachmentRenderer(allBlocks)}
    />
  )
}

interface BlockViewRendererProps {
  block: BookBlock
  allBlocks?: BookBlock[]
}

export function BlockViewRenderer({ block, allBlocks }: BlockViewRendererProps) {
  const definition = getBlockDefinition(block.type)
  if (!definition) {
    return <p>Tipo de bloco nao suportado: {block.type}</p>
  }

  const Component = definition.ViewComponent
  return (
    <Component
      block={block}
      allBlocks={allBlocks}
      renderQuizAttachment={createQuizAttachmentRenderer(allBlocks)}
      renderInteractiveResponse={createInteractiveResponseRenderer(allBlocks)}
    />
  )
}
