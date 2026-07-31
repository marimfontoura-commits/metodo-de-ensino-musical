import { normalizeTextSettings, type TextBlockData } from './types'
import { TextBlockPresentation, resolveTextPresentation } from './TextBlockPresentation'
import '../../../styles/blocks.css'

interface TextBlockEditProps {
  block: TextBlockData
  onChange: (next: TextBlockData) => void
}

export function TextBlockEdit({ block, onChange }: TextBlockEditProps) {
  const settings = normalizeTextSettings(block.settings)
  const presentation = resolveTextPresentation(settings)

  return (
    <div className="block-content">
      <TextBlockPresentation settings={settings}>
        <textarea
          id={`text-${block.id}`}
          className={`text-area text-inline-area ${presentation.typographyClassName}`}
          value={block.content.text}
          onChange={(event) =>
            onChange({
              ...block,
              content: {
                ...block.content,
                text: event.target.value,
              },
              settings,
            })
          }
          rows={5}
          placeholder="Digite um paragrafo"
        />
      </TextBlockPresentation>
    </div>
  )
}
