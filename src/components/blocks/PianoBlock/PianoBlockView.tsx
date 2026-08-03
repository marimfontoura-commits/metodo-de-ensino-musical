import type { PianoBlockData } from './types'
import { PianoBlockPresentation } from './PianoBlockPresentation'

interface PianoBlockViewProps {
  block: PianoBlockData
}

export function PianoBlockView({ block }: PianoBlockViewProps) {
  return <PianoBlockPresentation block={block} />
}
