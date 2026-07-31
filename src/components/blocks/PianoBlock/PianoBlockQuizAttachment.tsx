import { useMemo } from 'react'
import { generatePianoKeyboard } from '../../../music/piano'
import { normalizePianoContent, type PianoBlockData } from './types'
import { PianoKeyboard } from './PianoKeyboard'
import '../../../styles/blocks.css'

interface PianoBlockQuizAttachmentProps {
  block: PianoBlockData
}

export function PianoBlockQuizAttachment({ block }: PianoBlockQuizAttachmentProps) {
  const content = useMemo(() => normalizePianoContent(block.content), [block.content])
  const keyboard = useMemo(
    () => generatePianoKeyboard(content.firstNote, content.octaveCount),
    [content.firstNote, content.octaveCount],
  )
  const highlighted = useMemo(() => new Set(content.highlightedNoteIds), [content.highlightedNoteIds])

  return (
    <section className="piano-block" aria-label="Teclado de piano anexado ao quiz">
      <PianoKeyboard
        keys={keyboard.keys}
        totalWhites={keyboard.totalWhites}
        showNoteNames={content.showNoteNames}
        highlightedNoteIds={highlighted}
        onPress={() => undefined}
        interactive={false}
      />
    </section>
  )
}
