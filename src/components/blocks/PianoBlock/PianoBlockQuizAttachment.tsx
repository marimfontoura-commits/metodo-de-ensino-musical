import type { PianoBlockData } from './types'
import { PianoBlockPresentation } from './PianoBlockPresentation'

interface PianoBlockQuizAttachmentProps {
  block: PianoBlockData
}

export function PianoBlockQuizAttachment({ block }: PianoBlockQuizAttachmentProps) {
  return <PianoBlockPresentation block={block} attachment />
}
