// components/ui/page-header.tsx

// header component for pages

'use client'

import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  showDecorativeLine?: boolean;
  decorativeLineClassName?: string;
}

export default function PageHeader({
  title,
  description,
  className = "mb-12",
  titleClassName = "text-4xl font-bold text-[var(--text-primary)] mb-4",
  descriptionClassName = "text-lg text-[var(--text-secondary)]",
  showDecorativeLine = true,
  decorativeLineClassName = "h-0.5 w-24 bg-[var(--accent-primary)] mt-2 mb-4 rounded-full opacity-80"
}: PageHeaderProps) {
  return (
    <div className={className}>
      <h1 className={titleClassName}>{title}</h1>
      {showDecorativeLine && (
        <div className={decorativeLineClassName}></div>
      )}
      {description && (
        typeof description === 'string' 
          ? <p className={descriptionClassName}>{description}</p>
          : description
      )}
    </div>
  )
}