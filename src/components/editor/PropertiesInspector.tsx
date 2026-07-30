import type { BookBlock } from '../../models/book'
import { BlockPropertiesRenderer, getBlockLabel, hasPropertiesEditor } from '../blocks/registry'
import '../../styles/editor.css'

interface PropertiesInspectorProps {
  selectedBlock: BookBlock | null
  onChangeBlock: (blockId: string, next: BookBlock) => void
}

export function PropertiesInspector({ selectedBlock, onChangeBlock }: PropertiesInspectorProps) {
  if (!selectedBlock) {
    return (
      <aside className="inspector-panel" aria-label="Painel de propriedades">
        <h2 className="panel-title">Propriedades</h2>
        <p className="inspector-empty">Selecione um bloco para editar suas propriedades.</p>
      </aside>
    )
  }

  const hasProperties = hasPropertiesEditor(selectedBlock.type)

  return (
    <aside className="inspector-panel" aria-label="Painel de propriedades">
      <h2 className="panel-title">Propriedades</h2>
      <p className="inspector-meta">{getBlockLabel(selectedBlock.type)}</p>

      {hasProperties ? (
        <div className="inspector-content">
          <BlockPropertiesRenderer
            block={selectedBlock}
            onChange={(next) => onChangeBlock(selectedBlock.id, next)}
          />
        </div>
      ) : (
        <p className="inspector-empty">Este bloco nao possui propriedades adicionais.</p>
      )}
    </aside>
  )
}
