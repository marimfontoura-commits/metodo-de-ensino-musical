import { useMemo, useState } from 'react'
import { generatePianoKeyboard } from '../../../music/piano'
import { normalizePianoContent, type PianoBlockData } from './types'
import { PianoKeyboard } from './PianoKeyboard'
import '../../../styles/blocks.css'

interface PianoBlockViewProps {
  block: PianoBlockData
}

export function PianoBlockView({ block }: PianoBlockViewProps) {
  const content = useMemo(() => normalizePianoContent(block.content), [block.content])
  const keyboard = useMemo(
    () => generatePianoKeyboard(content.firstNote, content.octaveCount),
    [content.firstNote, content.octaveCount],
  )
  const highlighted = useMemo(() => new Set(content.highlightedNoteIds), [content.highlightedNoteIds])
  const [pressedNoteIds, setPressedNoteIds] = useState<string[]>([])

  function togglePressedNote(noteId: string) {
    setPressedNoteIds((current) =>
      current.includes(noteId) ? current.filter((item) => item !== noteId) : [...current, noteId],
    )
  }

  return (
    <section className="piano-block" aria-label="Teclado de piano">
      <PianoKeyboard
        keys={keyboard.keys}
        totalWhites={keyboard.totalWhites}
        showNoteNames={content.showNoteNames}
        highlightedNoteIds={highlighted}
        pressedNoteIds={new Set(pressedNoteIds)}
        onPress={togglePressedNote}
      />
    </section>
  )
}
