import { useEffect, useMemo, useRef, useState } from 'react'
import { generatePianoKeyboard } from '../../../music/piano'
import {
  normalizePianoContent,
  normalizePianoSettings,
  type PianoBlockData,
  type PianoLearnerAnswer,
} from './types'
import { PianoKeyboard } from './PianoKeyboard'
import type {
  InteractiveResponseController,
  InteractiveResponseStatus,
} from '../types'
import { evaluatePianoInteractiveResponse, getPianoInteractiveResponseStatus } from './interactiveResponse'
import '../../../styles/blocks.css'

interface PianoBlockPresentationProps {
  block: PianoBlockData
  attachment?: boolean
  interactiveResponse?: boolean
  locked?: boolean
  onControllerReady?: (controller: InteractiveResponseController | null) => void
  onStatusChange?: (status: InteractiveResponseStatus) => void
}

const EMPTY_ANSWER: PianoLearnerAnswer = { selectedNoteIds: [] }

export function PianoBlockPresentation({
  block,
  attachment = false,
  interactiveResponse = false,
  locked = false,
  onControllerReady,
  onStatusChange,
}: PianoBlockPresentationProps) {
  const content = useMemo(() => normalizePianoContent(block.content), [block.content])
  const settings = useMemo(() => normalizePianoSettings(block.settings), [block.settings])
  const keyboard = useMemo(
    () => generatePianoKeyboard(content.firstNote, content.octaveCount),
    [content.firstNote, content.octaveCount],
  )
  const authorHighlights = useMemo(() => new Set(content.highlightedNoteIds), [content.highlightedNoteIds])
  const rootRef = useRef<HTMLElement | null>(null)
  const exploreTimerRef = useRef<number | null>(null)
  const [isReaderMode, setIsReaderMode] = useState(false)
  const [answer, setAnswer] = useState<PianoLearnerAnswer>(EMPTY_ANSWER)
  const [exploredNoteId, setExploredNoteId] = useState('')
  const responseStatus = useMemo(
    () => getPianoInteractiveResponseStatus(settings, answer),
    [answer, settings],
  )
  const responseController = useMemo<InteractiveResponseController>(
    () => ({
      hasResponse: () => responseStatus.hasResponse,
      getStatus: () => responseStatus,
      evaluate: () => evaluatePianoInteractiveResponse(settings, answer),
      reset: () => setAnswer({ selectedNoteIds: [] }),
    }),
    [answer, responseStatus, settings],
  )

  useEffect(() => {
    setIsReaderMode(Boolean(rootRef.current?.closest('.reader-book')))
  }, [])

  useEffect(() => () => {
    if (exploreTimerRef.current !== null) {
      window.clearTimeout(exploreTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!interactiveResponse || !onControllerReady || !onStatusChange) {
      return
    }

    onControllerReady(responseController)
    onStatusChange(responseStatus)

    return () => onControllerReady(null)
  }, [interactiveResponse, onControllerReady, onStatusChange, responseController, responseStatus])

  const isStatic = !isReaderMode || settings.interactionMode === 'static' || locked
  const learnerSelections = new Set(answer.selectedNoteIds)
  const exploredNotes = exploredNoteId ? new Set([exploredNoteId]) : new Set<string>()

  function handleExplore(noteId: string) {
    setExploredNoteId(noteId)
    if (exploreTimerRef.current !== null) {
      window.clearTimeout(exploreTimerRef.current)
    }
    exploreTimerRef.current = window.setTimeout(() => setExploredNoteId(''), 220)
  }

  function handleSelectNote(noteId: string) {
    setAnswer((current) => {
      if (current.selectedNoteIds.includes(noteId)) {
        return { selectedNoteIds: current.selectedNoteIds.filter((item) => item !== noteId) }
      }

      if (settings.maxSelections !== null && current.selectedNoteIds.length >= settings.maxSelections) {
        return current
      }

      return { selectedNoteIds: [...current.selectedNoteIds, noteId] }
    })
  }

  function handlePress(noteId: string) {
    if (settings.interactionMode === 'explore') {
      handleExplore(noteId)
    } else if (settings.interactionMode === 'select-notes') {
      handleSelectNote(noteId)
    }
  }

  const showCounter =
    isReaderMode &&
    settings.interactionMode === 'select-notes' &&
    (settings.minSelections > 0 || settings.maxSelections !== null)

  return (
    <section
      ref={rootRef}
      className="piano-block"
      aria-label={attachment ? 'Teclado de piano anexado ao quiz' : 'Teclado de piano'}
    >
      <PianoKeyboard
        keys={keyboard.keys}
        totalWhites={keyboard.totalWhites}
        showNoteNames={content.showNoteNames}
        highlightedNoteIds={authorHighlights}
        pressedNoteIds={settings.interactionMode === 'explore' ? exploredNotes : undefined}
        learnerSelectedNoteIds={settings.interactionMode === 'select-notes' ? learnerSelections : undefined}
        onPress={handlePress}
        interactive={!isStatic}
      />
      {showCounter ? (
        <p className="piano-selection-counter" role="status" aria-live="polite">
          Selecionadas: {answer.selectedNoteIds.length}
          {settings.minSelections > 0 ? ` · mínimo ${settings.minSelections}` : ''}
          {settings.maxSelections !== null ? ` · máximo ${settings.maxSelections}` : ''}
        </p>
      ) : null}
    </section>
  )
}
