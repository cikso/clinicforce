import { CSSProperties } from 'react'

type LogoProps = {
  variant?: 'brand' | 'white'
  iconOnly?: boolean
  className?: string
  title?: string
  style?: CSSProperties
  'aria-hidden'?: boolean
}

const BRAND = '#00B578'
const WHITE = '#FFFFFF'

const WORDMARK_FONT_FAMILY =
  "var(--font-garamond), 'EB Garamond', 'Cormorant Garamond', Garamond, 'Times New Roman', serif"

export function Logo({
  variant = 'brand',
  iconOnly = false,
  className,
  title = 'ClinicForce',
  style,
  'aria-hidden': ariaHidden,
}: LogoProps) {
  const stroke = variant === 'white' ? WHITE : BRAND
  const dotFill = variant === 'white' ? BRAND : WHITE

  const mark = (
    <>
      <path
        d="M 75 25 A 35 35 0 1 0 75 75"
        stroke={stroke}
        strokeWidth="3.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 50 1 C 42.5 8.5, 42.5 21.5, 50 29 C 57.5 21.5, 57.5 8.5, 50 1 Z"
        fill={stroke}
      />
      <circle cx="50" cy="15" r="2.1" fill={dotFill} />
      <path
        d="M 50 71 C 42.5 78.5, 42.5 91.5, 50 99 C 57.5 91.5, 57.5 78.5, 50 71 Z"
        fill={stroke}
      />
      <circle cx="50" cy="85" r="2.1" fill={dotFill} />
      <g fill={stroke}>
        <rect x="46" y="30" width="8" height="40" rx="1.2" />
        <rect x="30" y="46" width="40" height="8" rx="1.2" />
      </g>
    </>
  )

  if (iconOnly) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className={className}
        style={style}
        role={ariaHidden ? undefined : 'img'}
        aria-hidden={ariaHidden}
        aria-label={ariaHidden ? undefined : title}
      >
        {!ariaHidden && <title>{title}</title>}
        {mark}
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 590 130"
      className={className}
      style={style}
      role={ariaHidden ? undefined : 'img'}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : title}
    >
      {!ariaHidden && <title>{title}</title>}
      <g transform="translate(18, 15)">{mark}</g>
      <text
        x="140"
        y="92"
        fontFamily={WORDMARK_FONT_FAMILY}
        fontSize="76"
        fontWeight={500}
        fill={stroke}
        letterSpacing="-0.5"
      >
        ClinicForce
      </text>
    </svg>
  )
}
