import { useDndContext, useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'

interface QuizAttachmentDropZoneProps {
  dropId: string
  title: string
  currentBlockId?: string
  children?: ReactNode
}

export function QuizAttachmentDropZone({ dropId, title, currentBlockId, children }: QuizAttachmentDropZoneProps) {
  const { active } = useDndContext()
  const activeId = active ? String(active.id) : ''
  const activeCanAttach = Boolean(active?.data?.current?.canAttachToQuiz)
  const isSameBlock = Boolean(currentBlockId && currentBlockId === activeId)
  const isOccupied = Boolean(currentBlockId && !isSameBlock)

  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    disabled: !activeCanAttach,
    data: {
      kind: 'quiz-slot',
      occupiedBy: currentBlockId ?? null,
    },
  })

  const classNames = ['quiz-attachment-slot', 'quiz-attachment-dropzone']
  if (activeCanAttach && !isOccupied) {
    classNames.push('is-compatible')
  }
  if (activeCanAttach && isOver && !isOccupied) {
    classNames.push('is-active')
  }
  if (activeCanAttach && isOccupied) {
    classNames.push('is-blocked')
  }

  return (
    <div ref={setNodeRef} className={classNames.join(' ')} aria-label={title}>
      {children ?? <p className="field-help">Solte aqui um bloco anexavel.</p>}
    </div>
  )
}
