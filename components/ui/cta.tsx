// components/ui/CTA.tsx

'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ReactNode } from 'react'

interface CtaButtonProps {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
  iconRight?: ReactNode
  fullWidthMobile?: boolean
  className?: string
}

export function CtaButton({
  href,
  children,
  variant = 'primary',
  iconRight,
  fullWidthMobile = true,
  className = ''
}: CtaButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all ${
        fullWidthMobile ? 'w-full sm:w-auto' : 'w-auto'
      } ${
        variant === 'primary'
          ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30'
          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
      } ${className}`}
    >
      {children}
      {iconRight || null}
    </Link>
  )
}

// With arrow icon
export function CtaButtonWithArrow({
  href,
  children,
  variant = 'primary',
  fullWidthMobile = true,
  className = ''
}: Omit<CtaButtonProps, 'iconRight'>) {
  return (
    <CtaButton
      href={href}
      variant={variant}
      fullWidthMobile={fullWidthMobile}
      className={`group ${className}`}
      iconRight={<ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
    >
      {children}
    </CtaButton>
  )
}