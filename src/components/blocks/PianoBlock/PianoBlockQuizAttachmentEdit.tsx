import type { PianoBlockData } from './types'
import { PianoBlockEdit } from './PianoBlockEdit'
import { PianoBlockProperties } from './PianoBlockProperties'

interface PianoBlockQuizAttachmentEditProps {
  block: PianoBlockData
  onChange: (next: PianoBlockData) => void
}

export function PianoBlockQuizAttachmentEdit({ block, onChange }: PianoBlockQuizAttachmentEditProps) {
  return (
    <div className="quiz-attachment-modal-editor">
      <PianoBlockEdit block={block} onChange={onChange} />
      <PianoBlockProperties block={block} onChange={onChange} />
    </div>
  )
}
