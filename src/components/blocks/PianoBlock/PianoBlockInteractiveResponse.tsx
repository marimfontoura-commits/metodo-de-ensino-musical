import type { InteractiveResponseComponentProps } from '../types'
import type { PianoBlockData } from './types'
import { PianoBlockPresentation } from './PianoBlockPresentation'

export function PianoBlockInteractiveResponse({
  block,
  locked,
  onControllerReady,
  onStatusChange,
}: InteractiveResponseComponentProps) {
  return (
    <PianoBlockPresentation
      block={block as PianoBlockData}
      attachment
      interactiveResponse
      locked={locked}
      onControllerReady={onControllerReady}
      onStatusChange={onStatusChange}
    />
  )
}
