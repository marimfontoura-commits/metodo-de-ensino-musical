import {
  getQuizOptionLabel,
  normalizeQuizContent,
  normalizeQuizSettings,
  type QuizBlockData,
} from './types'
import '../../../styles/blocks.css'

interface QuizBlockPropertiesProps {
  block: QuizBlockData
  onChange: (next: QuizBlockData) => void
}

export function QuizBlockProperties({ block, onChange }: QuizBlockPropertiesProps) {
  const content = normalizeQuizContent(block.content)
  const settings = normalizeQuizSettings(block.settings)

  function updateContent(nextContent: Partial<typeof content>) {
    onChange({
      ...block,
      content: {
        ...content,
        ...nextContent,
      },
    })
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

  return (
    <div className="block-content">
      <label className="field-label" htmlFor={`quiz-correct-${block.id}`}>
        Alternativa correta
      </label>
      <select
        id={`quiz-correct-${block.id}`}
        className="select-input"
        value={content.correctOptionId}
        onChange={(event) => updateContent({ correctOptionId: event.target.value })}
      >
        {content.options.map((option, index) => (
          <option key={option.id} value={option.id}>
            {getQuizOptionLabel(option, index)}
          </option>
        ))}
      </select>

      <label className="field-label" htmlFor={`quiz-option-image-size-${block.id}`}>
        Tamanho das imagens das alternativas
      </label>
      <select
        id={`quiz-option-image-size-${block.id}`}
        className="select-input"
        value={settings.optionImageSize}
        onChange={(event) =>
          updateSettings({
            optionImageSize:
              event.target.value === 'compact' || event.target.value === 'medium' || event.target.value === 'large'
                ? event.target.value
                : settings.optionImageSize,
          })
        }
      >
        <option value="compact">Compacto</option>
        <option value="medium">Medio</option>
        <option value="large">Grande</option>
      </select>

      <label className="field-label" htmlFor={`quiz-option-image-fit-${block.id}`}>
        Ajuste das imagens das alternativas
      </label>
      <select
        id={`quiz-option-image-fit-${block.id}`}
        className="select-input"
        value={settings.optionImageFit}
        onChange={(event) =>
          updateSettings({
            optionImageFit:
              event.target.value === 'contain' || event.target.value === 'cover'
                ? event.target.value
                : settings.optionImageFit,
          })
        }
      >
        <option value="contain">Conter</option>
        <option value="cover">Preencher</option>
      </select>

      <label className="field-label" htmlFor={`quiz-success-${block.id}`}>
        Feedback de acerto
      </label>
      <textarea
        id={`quiz-success-${block.id}`}
        className="text-area"
        rows={3}
        value={content.successFeedback}
        onChange={(event) => updateContent({ successFeedback: event.target.value })}
      />

      <label className="field-label" htmlFor={`quiz-error-${block.id}`}>
        Feedback de erro
      </label>
      <textarea
        id={`quiz-error-${block.id}`}
        className="text-area"
        rows={3}
        value={content.errorFeedback}
        onChange={(event) => updateContent({ errorFeedback: event.target.value })}
      />
    </div>
  )
}
