import { normalizeHeadingSettings, type HeadingBlockData } from './types'
import { HeadingBlockPresentation } from './HeadingBlockPresentation'
import '../../../styles/blocks.css'

interface HeadingBlockEditProps {
  block: HeadingBlockData
  onChange: (next: HeadingBlockData) => void
}

export function HeadingBlockEdit({ block, onChange }: HeadingBlockEditProps) {
  const settings = normalizeHeadingSettings(block.settings)

  return (
    <div className="block-content">
      <HeadingBlockPresentation settings={settings}>
        <input
          id={`heading-${block.id}`}
          className="text-input heading-inline-input"
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
          placeholder="Digite um titulo"
        />
      </HeadingBlockPresentation>
    </div>
  )
}
