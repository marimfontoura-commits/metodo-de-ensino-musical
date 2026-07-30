import type { TextBlockData } from './types'
import '../../../styles/blocks.css'

interface TextBlockEditProps {
  block: TextBlockData
  onChange: (next: TextBlockData) => void
}

export function TextBlockEdit({ block, onChange }: TextBlockEditProps) {
  return (
    <div className="block-content">
      <textarea
        id={`text-${block.id}`}
        className="text-area"
        value={block.content.text}
        onChange={(event) =>
          onChange({
            ...block,
            content: {
              ...block.content,
              text: event.target.value,
            },
          })
        }
        rows={5}
        placeholder="Digite um paragrafo"
      />
    </div>
  )
}
