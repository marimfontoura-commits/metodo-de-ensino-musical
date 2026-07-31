import type { Book } from '../../models/book'
import { BlockViewRenderer } from '../blocks/registry'
import { getRootBlocks } from '../blocks/quizAttachmentSlots'
import { BookTitleBanner } from './BookTitleBanner'
import '../../styles/editor.css'

interface BookReaderProps {
  book: Book
}

export function BookReader({ book }: BookReaderProps) {
  const rootBlocks = getRootBlocks(book.blocks)

  return (
    <main className="reader-stage" aria-label="Visualizacao final do livro">
      <article className="reader-book">
        <BookTitleBanner title={book.title} />

        <div className="reader-blocks">
          {rootBlocks.map((block) => (
            <section key={block.id} className="reader-block">
              <BlockViewRenderer block={block} allBlocks={book.blocks} />
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
