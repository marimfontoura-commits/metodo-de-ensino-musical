import type { Book } from '../models/book'

const STORAGE_KEY = 'interactive-book-editor:v1'

export function saveBook(book: Book): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(book))
}

export function loadBook(): Book | null {
  const rawValue = localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as Book
  } catch {
    return null
  }
}
