import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { hasRenderableImage } from '../imageSource'
import {
  getQuizOptionLabel,
  normalizeQuizContent,
  normalizeQuizSettings,
  type NormalizedQuizOption,
  type QuizBlockData,
} from './types'
import { QuizImagePreview } from './QuizImagePreview'
import '../../../styles/blocks.css'

interface QuizBlockViewProps {
  block: QuizBlockData
}

type AttemptStatus = 'idle' | 'correct' | 'incorrect'

interface QuizOptionChoiceProps {
  blockId: string
  option: NormalizedQuizOption
  index: number
  optionImageSize: 'compact' | 'medium' | 'large'
  optionImageFit: 'contain' | 'cover'
  groupName: string
  selectedOptionId: string
  isReaderMode: boolean
  isLockedAfterCheck: boolean
  onSelect: (optionId: string) => void
}

function QuizOptionChoice({
  blockId,
  option,
  index,
  optionImageSize,
  optionImageFit,
  groupName,
  selectedOptionId,
  isReaderMode,
  isLockedAfterCheck,
  onSelect,
}: QuizOptionChoiceProps) {
  const optionLabel = getQuizOptionLabel(option, index)

  return (
    <label
      key={option.id}
      className={selectedOptionId === option.id ? 'quiz-option is-selected' : 'quiz-option'}
      htmlFor={`quiz-option-${blockId}-${option.id}`}
    >
      <input
        id={`quiz-option-${blockId}-${option.id}`}
        type="radio"
        name={groupName}
        value={option.id}
        checked={selectedOptionId === option.id}
        aria-label={option.text.trim() ? undefined : optionLabel}
        onChange={(event) => {
          if (!isReaderMode || isLockedAfterCheck) {
            return
          }

          onSelect(event.target.value)
        }}
        disabled={!isReaderMode || isLockedAfterCheck}
      />

      <span className="quiz-option-content">
        <QuizImagePreview
          image={option.image}
          fallbackAlt={optionLabel}
          frameClassName={`quiz-option-image-frame size-${optionImageSize}`}
          className="quiz-option-image"
          fitMode={optionImageFit}
        />
        {option.text.trim() ? <span>{option.text}</span> : null}
      </span>
    </label>
  )
}

export function QuizBlockView({ block }: QuizBlockViewProps) {
  const content = useMemo(() => normalizeQuizContent(block.content), [block.content])
  const settings = useMemo(() => normalizeQuizSettings(block.settings), [block.settings])
  const hasVisualAlternatives = useMemo(
    () => content.options.some((option) => hasRenderableImage(option.image)),
    [content.options],
  )
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [attemptStatus, setAttemptStatus] = useState<AttemptStatus>('idle')
  const [isLockedAfterCheck, setIsLockedAfterCheck] = useState(false)
  const [isReaderMode, setIsReaderMode] = useState(false)
  const rootRef = useRef<HTMLElement | null>(null)
  const feedbackId = useId()
  const groupName = `quiz-${block.id}`

  useEffect(() => {
    setSelectedOptionId('')
    setAttemptStatus('idle')
    setIsLockedAfterCheck(false)
  }, [content.correctOptionId, content.options, content.question, content.questionImage])

  useEffect(() => {
    setIsReaderMode(Boolean(rootRef.current?.closest('.reader-book')))
  }, [])

  const canVerify = isReaderMode && selectedOptionId !== '' && !isLockedAfterCheck
  const feedbackText =
    attemptStatus === 'correct'
      ? content.successFeedback
      : attemptStatus === 'incorrect'
        ? content.errorFeedback
        : ''

  function verifyAnswer() {
    if (!canVerify) {
      return
    }

    const isCorrect = selectedOptionId === content.correctOptionId
    setAttemptStatus(isCorrect ? 'correct' : 'incorrect')
    setIsLockedAfterCheck(true)
  }

  function resetAttempt() {
    setSelectedOptionId('')
    setAttemptStatus('idle')
    setIsLockedAfterCheck(false)
  }

  return (
    <section ref={rootRef} className="quiz-block" aria-labelledby={`quiz-question-${block.id}`}>
      <fieldset className="quiz-fieldset">
        <legend id={`quiz-question-${block.id}`} className="quiz-question">
          {content.question || 'Pergunta sem texto'}
        </legend>

        <QuizImagePreview
          image={content.questionImage}
          fallbackAlt="Imagem da pergunta"
          className={`quiz-question-image quiz-question-image-size-${settings.questionImageSize}`}
        />

        <div className={hasVisualAlternatives ? 'quiz-options has-images' : 'quiz-options'}>
          {content.options.map((option, index) => (
            <QuizOptionChoice
              key={option.id}
              blockId={block.id}
              option={option}
              index={index}
              optionImageSize={settings.optionImageSize}
              optionImageFit={settings.optionImageFit}
              groupName={groupName}
              selectedOptionId={selectedOptionId}
              isReaderMode={isReaderMode}
              isLockedAfterCheck={isLockedAfterCheck}
              onSelect={setSelectedOptionId}
            />
          ))}
        </div>
      </fieldset>

      {isReaderMode ? (
        <div className="quiz-actions">
          <button type="button" className="mode-button" onClick={verifyAnswer} disabled={!canVerify}>
            Verificar resposta
          </button>
          <button type="button" className="mode-button" onClick={resetAttempt}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <p className="field-help">No modo Editar, esta area mostra apenas a previa do quiz.</p>
      )}

      <p
        id={feedbackId}
        className={
          attemptStatus === 'correct'
            ? 'quiz-feedback success'
            : attemptStatus === 'incorrect'
              ? 'quiz-feedback error'
              : 'quiz-feedback'
        }
        role="status"
        aria-live="polite"
      >
        {feedbackText}
      </p>
    </section>
  )
}
