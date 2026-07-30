import type { BlockType } from '../../models/book'
import { BLOCK_REGISTRY } from '../blocks/registry'
import '../../styles/editor.css'

interface SidePanelProps {
  onAddBlock: (type: BlockType) => void
}

export function SidePanel({ onAddBlock }: SidePanelProps) {
  return (
    <aside className="side-panel">
      <h2 className="panel-title">Componentes</h2>
      <ul className="palette-list">
        {BLOCK_REGISTRY.map((item) => (
          <li key={item.id} className="palette-item">
            <span className="palette-label">
              <strong>{item.icon}</strong>
              {item.name}
            </span>
            <button type="button" className="add-button" onClick={() => onAddBlock(item.id)}>
              Adicionar
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
