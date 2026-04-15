'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'accent'
  size?: 'default' | 'sm' | 'lg'
  asChild?: boolean
  href?: string
}

export function LandingButton({ className, variant = 'default', size = 'default', href, children, ...props }: ButtonProps) {
  const cls = cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
    {
      'bg-[#0A0A0A] text-[#FFFFFF] hover:bg-[#0A0A0A]/80 shadow-sm': variant === 'default',
      'bg-[#00D68F] text-[#FFFFFF] hover:bg-[#00B578] shadow-sm': variant === 'secondary',
      'bg-[#E25F38] text-white hover:bg-[#E25F38]/90 shadow-sm': variant === 'accent',
      'border border-black/10 bg-transparent hover:bg-black/5 text-[#0A0A0A]': variant === 'outline',
      'hover:bg-black/5 text-[#0A0A0A]': variant === 'ghost',
      'h-10 px-6 py-2': size === 'default',
      'h-9 px-4 text-xs': size === 'sm',
      'h-14 px-10 text-lg': size === 'lg',
    },
    className
  )

  if (href) {
    return (
      <a href={href} className={cls}>
        <span className="relative z-10 flex items-center justify-center">{children}</span>
      </a>
    )
  }

  return (
    <button className={cls} {...props}>
      <span className="relative z-10 flex items-center justify-center">{children}</span>
    </button>
  )
}
