import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import type { InteractiveResponseController, InteractiveResponseStatus } from '../types'
import {
  getQuizOptionLabel,
  normalizeQuizContent,
  type NormalizedQuizOption,
  type QuizBlockData,
} from './types'
import { createOptionSlotDropId, createQuestionSlotDropId } from './quizAttachmentDnd'
import { QuizAttachmentDraggable } from './QuizAttachmentDraggable'
import { QuizAttachmentDropZone } from './QuizAttachmentDropZone'
import '../../../styles/blocks.css'

interface QuizBlockViewProps {
  block: QuizBlockData
  renderQuizAttachment?: (blockId: string) => ReactElement | null
  renderInteractiveResponse?: (
    blockId: string,
    props: {
      locked: boolean
      onControllerReady: (controller: InteractiveResponseController | null) => void
      onStatusChange: (status: InteractiveResponseStatus) => void
    },
  ) => ReactElement | null
}

type AttemptStatus = 'idle' | 'correct' | 'incorrect'

interface QuizOptionChoiceProps {
  blockId: string
  option: NormalizedQuizOption
  index: number
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
        {option.text.trim() ? <span>{option.text}</span> : null}
      </span>
    </label>
  )
}

export function QuizBlockView({ block, renderQuizAttachment, renderInteractiveResponse }: QuizBlockViewProps) {
  const content = useMemo(() => normalizeQuizContent(block.content), [block.content])
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [openAnswer, setOpenAnswer] = useState('')
  const [attemptStatus, setAttemptStatus] = useState<AttemptStatus>('idle')
  const [isLockedAfterCheck, setIsLockedAfterCheck] = useState(false)
  const [isReaderMode, setIsReaderMode] = useState(false)
  const [interactiveStatus, setInteractiveStatus] = useState<InteractiveResponseStatus | null>(null)
  const [interactiveController, setInteractiveController] = useState<InteractiveResponseController | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)
  const feedbackId = useId()
  const groupName = `quiz-${block.id}`
  const questionAttachment =
    content.promptBlockId && renderQuizAttachment ? renderQuizAttachment(content.promptBlockId) : null
  const shouldShowQuizDropZones = !isReaderMode

  const handleInteractiveController = useCallback((controller: InteractiveResponseController | null) => {
    setInteractiveController(controller)
  }, [])

  const handleInteractiveStatus = useCallback((status: InteractiveResponseStatus) => {
    setInteractiveStatus(status)
  }, [])

  const interactiveResponse = content.responseBlockId && renderInteractiveResponse
    ? renderInteractiveResponse(content.responseBlockId, {
        locked: attemptStatus !== 'idle',
        onControllerReady: handleInteractiveController,
        onStatusChange: handleInteractiveStatus,
      })
    : null

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

  function submitInteractiveResponse() {
    if (!interactiveStatus?.canSubmit || attemptStatus !== 'idle') {
      return
    }

    const result = interactiveController?.evaluate()
    if (!result?.isComplete) {
      return
    }

    setAttemptStatus(result.isCorrect ? 'correct' : 'incorrect')
  }

  function retryInteractiveResponse() {
    interactiveController?.reset()
    setAttemptStatus('idle')
  }

  return (
    <section ref={rootRef} className="quiz-block" aria-labelledby={`quiz-question-${block.id}`}>
      <fieldset className="quiz-fieldset">
        <legend id={`quiz-question-${block.id}`} className="quiz-question">
          {content.prompt || 'Enunciado sem texto'}
        </legend>

        {shouldShowQuizDropZones ? (
          <QuizAttachmentDropZone
            dropId={createQuestionSlotDropId(block.id)}
            title="Slot de recurso do enunciado"
            currentBlockId={content.promptBlockId}
          >
            {questionAttachment && content.promptBlockId ? (
              <QuizAttachmentDraggable blockId={content.promptBlockId} canAttachToQuiz>
                {questionAttachment}
              </QuizAttachmentDraggable>
            ) : null}
          </QuizAttachmentDropZone>
        ) : questionAttachment ? (
          <div className="quiz-attachment-slot">{questionAttachment}</div>
        ) : null}

        {content.questionType === 'multiple-choice' ? <div className="quiz-options">
          {content.options.map((option, index) => (
            <div key={option.id} className="quiz-option-with-attachment">
              {shouldShowQuizDropZones ? (
                <QuizAttachmentDropZone
                  dropId={createOptionSlotDropId(block.id, option.id)}
                  title={`Slot de recurso da alternativa ${index + 1}`}
                  currentBlockId={option.blockId}
                >
                  {option.blockId && renderQuizAttachment ? (
                    <div className="quiz-option-attachment-slot">
                      <QuizAttachmentDraggable blockId={option.blockId} canAttachToQuiz>
                        {renderQuizAttachment(option.blockId)}
                      </QuizAttachmentDraggable>
                    </div>
                  ) : null}
                </QuizAttachmentDropZone>
              ) : option.blockId && renderQuizAttachment ? (
                <div className="quiz-attachment-slot quiz-option-attachment-slot">
                  {renderQuizAttachment(option.blockId)}
                </div>
              ) : null}

              <QuizOptionChoice
                blockId={block.id}
                option={option}
                index={index}
                groupName={groupName}
                selectedOptionId={selectedOptionId}
                isReaderMode={isReaderMode}
                isLockedAfterCheck={isLockedAfterCheck}
                onSelect={setSelectedOptionId}
              />
            </div>
          ))}
        </div> : null}

        {content.questionType === 'open-response' ? (
          <textarea
            className="text-area quiz-open-response"
            rows={4}
            value={openAnswer}
            maxLength={content.openResponseConfig.maxLength}
            placeholder={content.openResponseConfig.placeholder}
            disabled={!isReaderMode}
            onChange={(event) => setOpenAnswer(event.target.value)}
            aria-label="Resposta aberta"
          />
        ) : null}

        {content.questionType === 'interactive-response' && interactiveResponse ? (
          <div className="quiz-attachment-slot quiz-interactive-response">{interactiveResponse}</div>
        ) : null}
      </fieldset>

      {isReaderMode && content.questionType === 'multiple-choice' ? (
        <div className="quiz-actions">
          <button type="button" className="mode-button" onClick={verifyAnswer} disabled={!canVerify}>
            Verificar resposta
          </button>
          <button type="button" className="mode-button" onClick={resetAttempt}>
            Tentar novamente
          </button>
        </div>
      ) : !isReaderMode ? (
        <p className="field-help">No modo Editar, esta área mostra apenas a prévia da questão.</p>
      ) : content.questionType === 'open-response' ? (
        <p className="field-help">A resposta fica apenas nesta sessão de leitura.</p>
      ) : content.questionType === 'interactive-response' && interactiveResponse ? (
        <div className="quiz-interactive-submit">
          {attemptStatus === 'idle' ? (
            <button
              type="button"
              className="mode-button"
              onClick={submitInteractiveResponse}
              disabled={!interactiveStatus?.canSubmit}
            >
              Enviar resposta
            </button>
          ) : null}
          {attemptStatus === 'incorrect' ? (
            <button type="button" className="mode-button" onClick={retryInteractiveResponse}>
              Tentar novamente
            </button>
          ) : null}
          {attemptStatus === 'idle' && interactiveStatus?.message ? (
            <p className="field-help">{interactiveStatus.message}</p>
          ) : null}
        </div>
      ) : content.questionType === 'interactive-response' ? (
        <p className="field-help">Esta questão ainda não possui um componente de resposta válido.</p>
      ) : null}

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
        {content.questionType === 'multiple-choice'
          ? feedbackText
          : content.questionType === 'interactive-response' && attemptStatus === 'correct'
            ? content.successFeedback.trim() || 'Resposta correta.'
            : content.questionType === 'interactive-response' && attemptStatus === 'incorrect'
              ? content.errorFeedback.trim() || 'Resposta incorreta. Tente novamente.'
              : ''}
      </p>
    </section>
  )
}
