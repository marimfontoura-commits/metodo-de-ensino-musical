import { createId } from '../../../services/idService'
import { hasRenderableImage } from '../imageSource'
import {
  QUIZ_LIMITS,
  normalizeQuizContent,
  normalizeQuizOptionList,
  normalizeQuizSettings,
  type QuizBlockData,
  type QuizOption,
} from './types'
import { QuizInlineImageEditor } from './QuizInlineImageEditor'
import { QuizImagePreview } from './QuizImagePreview'
import '../../../styles/blocks.css'

interface QuizBlockEditProps {
  block: QuizBlockData
  onChange: (next: QuizBlockData) => void
}

export function QuizBlockEdit({ block, onChange }: QuizBlockEditProps) {
  const content = normalizeQuizContent(block.content)
  const settings = normalizeQuizSettings(block.settings)
  const hasVisualAlternatives = content.options.some((option) => hasRenderableImage(option.image))

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

  function updateSettings(nextSettings: Partial<QuizBlockData['settings']>) {
    onChange({
      ...block,
      settings: {
        ...settings,
        ...nextSettings,
      },
    })
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

  return (
    <section className="quiz-block editing" aria-labelledby={`quiz-question-${block.id}`}>
      <div className="quiz-question-editor-row">
        <textarea
          id={`quiz-question-${block.id}`}
          className="quiz-inline-question-input"
          value={content.question}
          onChange={(event) => updateContent({ question: event.target.value })}
          placeholder="Digite a pergunta"
          rows={2}
        />
        <QuizInlineImageEditor
          idPrefix={`quiz-question-image-${block.id}`}
          label="pergunta"
          value={content.questionImage}
          onChange={(next) => updateContent({ questionImage: next })}
        />
        <label className="quiz-inline-size-select">
          <span className="field-label">Tamanho da imagem</span>
          <select
            className="select-input"
            value={settings.questionImageSize}
            onChange={(event) =>
              updateSettings({
                questionImageSize:
                  event.target.value === 'small' ||
                  event.target.value === 'medium' ||
                  event.target.value === 'large' ||
                  event.target.value === 'full'
                    ? event.target.value
                    : settings.questionImageSize,
              })
            }
          >
            <option value="small">Pequena</option>
            <option value="medium">Media</option>
            <option value="large">Grande</option>
            <option value="full">Completa</option>
          </select>
        </label>
      </div>

      <QuizImagePreview
        image={content.questionImage}
        fallbackAlt="Imagem da pergunta"
        className={`quiz-question-image quiz-question-image-size-${settings.questionImageSize}`}
      />

      <div className={hasVisualAlternatives ? 'quiz-options has-images' : 'quiz-options'}>
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
              <div className="quiz-option-edit-row">
                <textarea
                  className="quiz-inline-option-input"
                  value={option.text}
                  onChange={(event) => updateOption(option.id, { text: event.target.value })}
                  rows={2}
                  placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                />

                <div className="quiz-option-actions" aria-label={`Acoes da alternativa ${index + 1}`}>
                  <QuizInlineImageEditor
                    idPrefix={`quiz-option-image-${block.id}-${option.id}`}
                    label={`alternativa ${index + 1}`}
                    value={option.image}
                    onChange={(next) => updateOption(option.id, { image: next })}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    title="Mover alternativa para cima"
                    aria-label="Mover alternativa para cima"
                    onClick={() => moveOption(option.id, -1)}
                    disabled={index === 0}
                  >
                    ^
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    title="Mover alternativa para baixo"
                    aria-label="Mover alternativa para baixo"
                    onClick={() => moveOption(option.id, 1)}
                    disabled={index === content.options.length - 1}
                  >
                    v
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    title="Remover alternativa"
                    aria-label="Remover alternativa"
                    onClick={() => removeOption(option.id)}
                    disabled={content.options.length <= QUIZ_LIMITS.minOptions}
                  >
                    x
                  </button>
                </div>
              </div>

              <QuizImagePreview
                image={option.image}
                fallbackAlt={`Imagem da alternativa ${index + 1}`}
                frameClassName={`quiz-option-image-frame size-${settings.optionImageSize}`}
                className="quiz-option-image"
                fitMode={settings.optionImageFit}
              />
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
    </section>
  )
}