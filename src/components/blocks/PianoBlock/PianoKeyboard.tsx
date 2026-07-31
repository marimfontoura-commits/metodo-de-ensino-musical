import type { CSSProperties } from 'react'
import { getPitchClass } from '../../../music/notes'
import type { PianoKeyModel } from '../../../music/piano'

interface PianoKeyboardProps {
  keys: PianoKeyModel[]
  totalWhites: number
  showNoteNames: boolean
  highlightedNoteIds: Set<string>
  pressedNoteIds?: Set<string>
  interactive?: boolean
  onPress: (noteId: string) => void
}

function getKeyClassName(
  isBlack: boolean,
  noteId: string,
  highlightedNoteIds: Set<string>,
  pressedNoteIds: Set<string>,
): string {
  const classNames = [isBlack ? 'piano-key piano-key-black' : 'piano-key piano-key-white']

  if (highlightedNoteIds.has(noteId)) {
    classNames.push('is-highlighted')
  }

  if (pressedNoteIds.has(noteId)) {
    classNames.push('is-pressed')
  }

  return classNames.join(' ')
}

export function PianoKeyboard({
  keys,
  totalWhites,
  showNoteNames,
  highlightedNoteIds,
  pressedNoteIds,
  interactive = true,
  onPress,
}: PianoKeyboardProps) {
  const activePressed = pressedNoteIds ?? new Set<string>()
  const whiteKeys = keys.filter((key) => !key.isBlack)
  const blackKeys = keys.filter((key) => key.isBlack)

  return (
    <div
      className={interactive ? 'piano-keyboard' : 'piano-keyboard piano-keyboard-static'}
      style={{ '--white-key-count': totalWhites } as CSSProperties}
    >
      <div className="piano-white-keys">
        {whiteKeys.map((key) => (
          <button
            key={key.noteId}
            type="button"
            className={getKeyClassName(false, key.noteId, highlightedNoteIds, activePressed)}
            onClick={() => {
              if (interactive) {
                onPress(key.noteId)
              }
            }}
            aria-label={`Nota ${key.noteId}`}
            disabled={!interactive}
          >
            {showNoteNames ? <span className="piano-note-label">{getPitchClass(key.noteId)}</span> : null}
          </button>
        ))}
      </div>

      <div className="piano-black-keys">
        {blackKeys.map((key) => (
          <button
            key={key.noteId}
            type="button"
            className={getKeyClassName(true, key.noteId, highlightedNoteIds, activePressed)}
            style={{ left: `${key.blackLeftPercent ?? 0}%` }}
            onClick={() => {
              if (interactive) {
                onPress(key.noteId)
              }
            }}
            aria-label={`Nota ${key.noteId}`}
            disabled={!interactive}
          >
            {showNoteNames ? <span className="piano-note-label piano-note-label-black">{getPitchClass(key.noteId)}</span> : null}
          </button>
        ))}
      </div>
    </div>
  )
}
