type EditorIconName = 'image' | 'moreVert' | 'arrowUp' | 'arrowDown' | 'delete' | 'close'

interface EditorIconProps {
  name: EditorIconName
  className?: string
  size?: number
  decorative?: boolean
}

export function EditorIcon({ name, className, size = 18, decorative = true }: EditorIconProps) {
  const commonProps = {
    className,
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': decorative,
    focusable: false,
  } as const

  switch (name) {
    case 'image':
      return (
        <svg {...commonProps}>
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="9" cy="10" r="1.6" fill="currentColor" />
          <path d="M5.5 17L11 12L14.5 15L17 13L20.5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'moreVert':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="6" r="1.7" fill="currentColor" />
          <circle cx="12" cy="12" r="1.7" fill="currentColor" />
          <circle cx="12" cy="18" r="1.7" fill="currentColor" />
        </svg>
      )
    case 'arrowUp':
      return (
        <svg {...commonProps}>
          <path d="M12 18V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7.5 11.5L12 7L16.5 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'arrowDown':
      return (
        <svg {...commonProps}>
          <path d="M12 6V17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7.5 12.5L12 17L16.5 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'delete':
      return (
        <svg {...commonProps}>
          <path d="M5 7H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9 7V5.5C9 4.67 9.67 4 10.5 4H13.5C14.33 4 15 4.67 15 5.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 7L8.8 18C8.87 18.96 9.67 19.7 10.64 19.7H13.36C14.33 19.7 15.13 18.96 15.2 18L16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.5 10.5V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M13.5 10.5V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'close':
      return (
        <svg {...commonProps}>
          <path d="M7 7L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M17 7L7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
  }
}