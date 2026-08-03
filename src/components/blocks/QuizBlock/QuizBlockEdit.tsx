import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { createId } from '../../../services/idService'
import type { BookBlock } from '../../../models/book'
import type { QuizAttachableBlockOption, QuizAttachmentEditorSize, QuizAttachmentTarget } from '../types'
import {
  QUIZ_LIMITS,
  normalizeQuizContent,
  normalizeQuizOptionList,
  type QuizBlockData,
  type QuizOption,
} from './types'
import { EditorIcon } from '../../editor/EditorIcon'
import { QuizResourceSlot } from './QuizResourceSlot'
import '../../../styles/blocks.css'

interface QuizBlockEditProps {
  block: QuizBlockData
  onChange: (next: QuizBlockData) => void
  renderQuizAttachment?: (blockId: string) => ReactElement | null
  renderQuizAttachmentEditor?: (block: BookBlock, onChange: (next: BookBlock) => void) => ReactElement | null
  getQuizAttachmentEditorSize?: (block: BookBlock) => QuizAttachmentEditorSize
  quizAttachableBlockOptions?: QuizAttachableBlockOption[]
  interactiveResponseBlockOptions?: QuizAttachableBlockOption[]
  allBlocks?: BookBlock[]
  onCreateQuizAttachment?: (type: string, target: QuizAttachmentTarget) => BookBlock | null
  onUpdateQuizAttachment?: (blockId: string, next: BookBlock) => void
  onMoveQuizAttachmentToRoot?: (blockId: string, quizBlockId: string) => void
}

export function QuizBlockEdit({
  block,
  onChange,
  renderQuizAttachment,
  renderQuizAttachmentEditor,
  getQuizAttachmentEditorSize,
  quizAttachableBlockOptions = [],
  interactiveResponseBlockOptions = [],
  allBlocks = [],
  onCreateQuizAttachment,
  onUpdateQuizAttachment,
  onMoveQuizAttachmentToRoot,
}: QuizBlockEditProps) {
  const content = normalizeQuizContent(block.content)
  const [openMenuOptionId, setOpenMenuOptionId] = useState('')

  useEffect(() => {
    if (!openMenuOptionId) {
      return
    }

    function handleDocumentClick() {
      setOpenMenuOptionId('')
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenuOptionId('')
      }
    }

    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [openMenuOptionId])

  function updateContent(nextContent: Partial<QuizBlockData['content']>) {
    onChange({
      ...block,
      content: {
        ...content,
        ...nextContent,
      },
    })
  }

  function updateOptions(nextOptions: QuizOption[]) {
    updateContent({ options: normalizeQuizOptionList(nextOptions) })
  }

  function updateOption(optionId: string, nextPatch: Partial<QuizOption>) {
    updateOptions(
      content.options.map((option) =>
        option.id === optionId
          ? {
              ...option,
              ...nextPatch,
            }
          : option,
      ),
    )
  }

  function addOption() {
    if (content.options.length >= QUIZ_LIMITS.maxOptions) {
      return
    }

    updateOptions([
      ...content.options,
      {
        id: createId('opt'),
        text: `Alternativa ${String.fromCharCode(65 + content.options.length)}`,
      },
    ])
  }

  function removeOption(optionId: string) {
    if (content.options.length <= QUIZ_LIMITS.minOptions) {
      return
    }

    const nextOptions = content.options.filter((option) => option.id !== optionId)
    const nextCorrectId =
      content.correctOptionId === optionId ? nextOptions[0]?.id ?? content.correctOptionId : content.correctOptionId

    updateContent({
      options: normalizeQuizOptionList(nextOptions),
      correctOptionId: nextCorrectId,
    })
  }

  function moveOption(optionId: string, direction: -1 | 1) {
    const index = content.options.findIndex((option) => option.id === optionId)
    const targetIndex = index + direction

    if (index < 0 || targetIndex < 0 || targetIndex >= content.options.length) {
      return
    }

    const nextOptions = [...content.options]
    const [item] = nextOptions.splice(index, 1)
    nextOptions.splice(targetIndex, 0, item)
    updateOptions(nextOptions)
  }

  function toggleOptionMenu(optionId: string) {
    setOpenMenuOptionId((current) => (current === optionId ? '' : optionId))
  }

  function closeOptionMenu() {
    setOpenMenuOptionId('')
  }

  const canManageResources = Boolean(
    renderQuizAttachment &&
    renderQuizAttachmentEditor &&
    getQuizAttachmentEditorSize &&
    onCreateQuizAttachment &&
    onUpdateQuizAttachment &&
    onMoveQuizAttachmentToRoot,
  )

  return (
    <section className="quiz-block editing" aria-labelledby={`quiz-question-${block.id}`}>
      <div className="quiz-question-editor-row">
        <textarea
          id={`quiz-question-${block.id}`}
          className="quiz-inline-question-input"
          value={content.prompt}
          onChange={(event) => updateContent({ prompt: event.target.value, question: event.target.value })}
          placeholder="Digite o enunciado"
          rows={2}
        />
      </div>

      {canManageResources ? (
        <QuizResourceSlot
          label="enunciado"
          currentBlockId={content.promptBlockId}
          allBlocks={allBlocks}
          target={{ kind: 'question', quizBlockId: block.id }}
          attachableOptions={quizAttachableBlockOptions}
          renderAttachment={renderQuizAttachment!}
          renderAttachmentEditor={renderQuizAttachmentEditor!}
          getAttachmentEditorSize={getQuizAttachmentEditorSize!}
          onCreate={onCreateQuizAttachment!}
          onUpdate={onUpdateQuizAttachment!}
          onMoveToRoot={onMoveQuizAttachmentToRoot!}
        />
      ) : null}

      {content.questionType === 'multiple-choice' ? <>
      <div className="quiz-options">
        {content.options.map((option, index) => (
          <label
            key={option.id}
            className={content.correctOptionId === option.id ? 'quiz-option is-selected' : 'quiz-option'}
            htmlFor={`quiz-edit-option-${block.id}-${option.id}`}
          >
            <input
              id={`quiz-edit-option-${block.id}-${option.id}`}
              type="radio"
              name={`quiz-edit-${block.id}`}
              checked={content.correctOptionId === option.id}
              onChange={() => {
                updateContent({ correctOptionId: option.id })
              }}
              disabled
              aria-hidden="true"
            />

            <span className="quiz-option-content">
              {canManageResources ? (
                <QuizResourceSlot
                  label={`alternativa ${index + 1}`}
                  currentBlockId={option.blockId}
                  allBlocks={allBlocks}
                  target={{ kind: 'option', quizBlockId: block.id, optionId: option.id }}
                  attachableOptions={quizAttachableBlockOptions}
                  renderAttachment={renderQuizAttachment!}
                  renderAttachmentEditor={renderQuizAttachmentEditor!}
                  getAttachmentEditorSize={getQuizAttachmentEditorSize!}
                  onCreate={onCreateQuizAttachment!}
                  onUpdate={onUpdateQuizAttachment!}
                  onMoveToRoot={onMoveQuizAttachmentToRoot!}
                />
              ) : null}

              <div className="quiz-option-edit-row">
                <textarea
                  className="quiz-inline-option-input"
                  value={option.text}
                  onChange={(event) => updateOption(option.id, { text: event.target.value })}
                  rows={2}
                  placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                />

                <div className="quiz-option-actions" aria-label={`Acoes da alternativa ${index + 1}`}>
                  <div className="quiz-option-secondary-actions">
                    <button
                      type="button"
                      className="icon-button"
                      title="Mais opcoes"
                      aria-label="Mais opcoes da alternativa"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        toggleOptionMenu(option.id)
                      }}
                    >
                      <EditorIcon name="moreVert" className="icon-mark" decorative />
                    </button>

                    {openMenuOptionId === option.id ? (
                      <div
                        className="quiz-option-menu"
                        role="menu"
                        aria-label={`Menu da alternativa ${index + 1}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="quiz-option-menu-item"
                          title="Mover para cima"
                          aria-label="Mover alternativa para cima"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            moveOption(option.id, -1)
                            closeOptionMenu()
                          }}
                          disabled={index === 0}
                        >
                          <EditorIcon name="arrowUp" className="icon-mark" decorative />
                          Mover para cima
                        </button>

                        <button
                          type="button"
                          className="quiz-option-menu-item"
                          title="Mover para baixo"
                          aria-label="Mover alternativa para baixo"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            moveOption(option.id, 1)
                            closeOptionMenu()
                          }}
                          disabled={index === content.options.length - 1}
                        >
                          <EditorIcon name="arrowDown" className="icon-mark" decorative />
                          Mover para baixo
                        </button>

                        <button
                          type="button"
                          className="quiz-option-menu-item"
                          title="Remover alternativa"
                          aria-label="Remover alternativa"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            removeOption(option.id)
                            closeOptionMenu()
                          }}
                          disabled={content.options.length <= QUIZ_LIMITS.minOptions}
                        >
                          <EditorIcon name="delete" className="icon-mark" decorative />
                          Remover alternativa
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

            </span>
          </label>
        ))}
      </div>

      <div className="quiz-actions">
        <button
          type="button"
          className="ghost-button"
          onClick={addOption}
          disabled={content.options.length >= QUIZ_LIMITS.maxOptions}
        >
          Adicionar alternativa
        </button>
      </div>
      <p className="field-help">No modo Editar, radios sao apenas representativos.</p>
      </> : null}

      {content.questionType === 'open-response' ? (
        <div className="quiz-open-response-preview">
          <textarea
            value=""
            rows={3}
            disabled
            placeholder={content.openResponseConfig.placeholder}
            aria-label="Prévia do campo de resposta aberta"
          />
          <p className="field-help">Configure a resposta esperada e a comparação no painel de propriedades.</p>
        </div>
      ) : null}

      {content.questionType === 'interactive-response' && canManageResources ? (
        <QuizResourceSlot
          label="resposta interativa"
          currentBlockId={content.responseBlockId}
          allBlocks={allBlocks}
          target={{ kind: 'response', quizBlockId: block.id }}
          attachableOptions={interactiveResponseBlockOptions}
          emptyButtonLabel="+ Adicionar componente de resposta"
          pickerTitle="Adicionar componente de resposta"
          renderAttachment={renderQuizAttachment!}
          renderAttachmentEditor={renderQuizAttachmentEditor!}
          getAttachmentEditorSize={getQuizAttachmentEditorSize!}
          onCreate={onCreateQuizAttachment!}
          onUpdate={onUpdateQuizAttachment!}
          onMoveToRoot={onMoveQuizAttachmentToRoot!}
        />
      ) : null}
    </section>
  )
}
