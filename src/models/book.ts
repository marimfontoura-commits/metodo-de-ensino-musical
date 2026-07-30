export type BlockType = string

export interface BookBlock {
  id: string
  type: BlockType
  content: unknown
  settings: unknown
}

export interface Book {
  id: string
  title: string
  blocks: BookBlock[]
}

export type EditorMode = 'edit' | 'preview'
