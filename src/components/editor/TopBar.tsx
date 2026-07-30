import type { EditorMode } from '../../models/book'
import '../../styles/editor.css'

interface TopBarProps {
  mode: EditorMode
  onSetMode: (mode: EditorMode) => void
}

export function TopBar({ mode, onSetMode }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="project-name">Editor Modular de Livro Digital</div>
      <div className="mode-actions">
        <button
          type="button"
          className={mode === 'edit' ? 'mode-button active' : 'mode-button'}
          onClick={() => onSetMode('edit')}
        >
          Editar
        </button>
        <button
          type="button"
          className={mode === 'preview' ? 'mode-button active' : 'mode-button'}
          onClick={() => onSetMode('preview')}
        >
          Visualizar
        </button>
      </div>
    </header>
  )
}
