import { useMemo } from 'react'
import { generatePianoKeyboard } from '../../../music/piano'
import { normalizePianoContent, type PianoBlockData } from './types'
import { PianoKeyboard } from './PianoKeyboard'
import '../../../styles/blocks.css'

interface PianoBlockEditProps {
  block: PianoBlockData
  onChange: (next: PianoBlockData) => void
}

export function PianoBlockEdit({ block, onChange }: PianoBlockEditProps) {
  const content = useMemo(() => normalizePianoContent(block.content), [block.content])
  const keyboard = useMemo(
    () => generatePianoKeyboard(content.firstNote, content.octaveCount),
    [content.firstNote, content.octaveCount],
  )
  const highlighted = useMemo(() => new Set(content.highlightedNoteIds), [content.highlightedNoteIds])

  function toggleHighlightedNote(noteId: string) {
    const next = new Set(content.highlightedNoteIds)
    if (next.has(noteId)) {
      next.delete(noteId)
    } else {
      next.add(noteId)
    }

    onChange({
      ...block,
      content: {
        ...content,
        highlightedNoteIds: Array.from(next),
      },
    })
  }

  return (
    <section className="piano-block piano-block-editing" aria-label="Editor de teclado do piano">
      <PianoKeyboard
        keys={keyboard.keys}
        totalWhites={keyboard.totalWhites}
        showNoteNames={content.showNoteNames}
        highlightedNoteIds={highlighted}
        onPress={toggleHighlightedNote}
      />
      <p className="field-help">Clique nas teclas para destacar ou remover notas.</p>
    </section>
  )
}
