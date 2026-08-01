import { getQuizOptionLabel, normalizeQuizContent, type QuizBlockData } from './types'
import '../../../styles/blocks.css'

interface QuizBlockPropertiesProps {
  block: QuizBlockData
  onChange: (next: QuizBlockData) => void
}

export function QuizBlockProperties({ block, onChange }: QuizBlockPropertiesProps) {
  const content = normalizeQuizContent(block.content)

  function updateContent(nextContent: Partial<typeof content>) {
    onChange({ ...block, content: { ...content, ...nextContent } })
  }

  function updateOpenConfig(next: Partial<typeof content.openResponseConfig>) {
    updateContent({ openResponseConfig: { ...content.openResponseConfig, ...next } })
  }

  return (
    <div className="block-content">
      <label className="field-label" htmlFor={`question-type-${block.id}`}>Tipo de questão</label>
      <select
        id={`question-type-${block.id}`}
        className="select-input"
        value={content.questionType}
        onChange={(event) => updateContent({ questionType: event.target.value as typeof content.questionType })}
      >
        <option value="multiple-choice">Múltipla escolha</option>
        <option value="open-response">Resposta aberta</option>
        <option value="interactive-response">Resposta interativa</option>
      </select>

      {content.questionType === 'multiple-choice' ? <>
        <label className="field-label" htmlFor={`quiz-correct-${block.id}`}>Alternativa correta</label>
        <select
          id={`quiz-correct-${block.id}`}
          className="select-input"
          value={content.correctOptionId}
          onChange={(event) => updateContent({ correctOptionId: event.target.value })}
        >
          {content.options.map((option, index) => (
            <option key={option.id} value={option.id}>{getQuizOptionLabel(option, index)}</option>
          ))}
        </select>
      </> : null}

      {content.questionType === 'open-response' ? <>
        <label className="field-label" htmlFor={`question-placeholder-${block.id}`}>Texto de orientação</label>
        <input
          id={`question-placeholder-${block.id}`}
          className="text-input"
          value={content.openResponseConfig.placeholder}
          onChange={(event) => updateOpenConfig({ placeholder: event.target.value })}
        />
        <label className="field-label" htmlFor={`question-answer-${block.id}`}>Resposta esperada (autoria)</label>
        <textarea
          id={`question-answer-${block.id}`}
          className="text-area"
          rows={3}
          value={content.openResponseConfig.expectedAnswer}
          onChange={(event) => updateOpenConfig({ expectedAnswer: event.target.value })}
        />
        <label className="field-label" htmlFor={`question-comparison-${block.id}`}>Comparação futura</label>
        <select
          id={`question-comparison-${block.id}`}
          className="select-input"
          value={content.openResponseConfig.comparisonMode}
          onChange={(event) => updateOpenConfig({ comparisonMode: event.target.value as 'exact' | 'normalized' })}
        >
          <option value="exact">Exata</option>
          <option value="normalized">Ignorar maiúsculas e espaços extras</option>
        </select>
        <label className="field-label" htmlFor={`question-limit-${block.id}`}>Limite de caracteres (opcional)</label>
        <input
          id={`question-limit-${block.id}`}
          className="text-input"
          type="number"
          min={1}
          value={content.openResponseConfig.maxLength ?? ''}
          onChange={(event) => updateOpenConfig({ maxLength: event.target.value ? Number(event.target.value) : undefined })}
        />
      </> : null}

      {content.questionType === 'interactive-response' ? (
        <p className="field-help">A resposta do aluno acontece no componente anexado à questão.</p>
      ) : null}

      <label className="field-label" htmlFor={`quiz-success-${block.id}`}>Feedback de acerto</label>
      <textarea id={`quiz-success-${block.id}`} className="text-area" rows={3} value={content.successFeedback} onChange={(event) => updateContent({ successFeedback: event.target.value })} />

      <label className="field-label" htmlFor={`quiz-error-${block.id}`}>Feedback de erro</label>
      <textarea id={`quiz-error-${block.id}`} className="text-area" rows={3} value={content.errorFeedback} onChange={(event) => updateContent({ errorFeedback: event.target.value })} />
    </div>
  )
}
