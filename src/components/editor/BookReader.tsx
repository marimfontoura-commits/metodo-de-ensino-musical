import type { Book } from '../../models/book'
import { BlockViewRenderer } from '../blocks/registry'
import { BookTitleBanner } from './BookTitleBanner'
import '../../styles/editor.css'

interface BookReaderProps {
  book: Book
}

export function BookReader({ book }: BookReaderProps) {
  return (
    <main className="reader-stage" aria-label="Visualizacao final do livro">
      <article className="reader-book">
        <BookTitleBanner title={book.title} />

        <div className="reader-blocks">
          {book.blocks.map((block) => (
            <section key={block.id} className="reader-block">
              <BlockViewRenderer block={block} />
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
