import '../../styles/editor.css'

interface BookTitleBannerProps {
  title: string
  editable?: boolean
  onChangeTitle?: (nextTitle: string) => void
  onFocusTitle?: () => void
}

export function BookTitleBanner({
  title,
  editable = false,
  onChangeTitle,
  onFocusTitle,
}: BookTitleBannerProps) {
  return (
    <header className="book-title-banner">
      <h1
        className="book-title"
        contentEditable={editable}
        suppressContentEditableWarning={editable}
        role={editable ? 'textbox' : undefined}
        aria-label="Titulo do livro"
        onInput={(event) => {
          if (!editable || !onChangeTitle) {
            return
          }

          onChangeTitle(event.currentTarget.textContent ?? '')
        }}
        onKeyDown={(event) => {
          if (editable && event.key === 'Enter') {
            event.preventDefault()
          }
        }}
        onFocus={() => {
          if (editable) {
            onFocusTitle?.()
          }
        }}
      >
        {title}
      </h1>
    </header>
  )
}