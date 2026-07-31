import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'

interface QuizAttachmentDraggableProps {
  blockId: string
  canAttachToQuiz: boolean
  children: ReactNode
}

export function QuizAttachmentDraggable({ blockId, canAttachToQuiz, children }: QuizAttachmentDraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: blockId,
    data: {
      kind: 'block',
      blockId,
      canAttachToQuiz,
      source: 'quiz-attachment',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'quiz-attachment-draggable is-dragging' : 'quiz-attachment-draggable'}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}
