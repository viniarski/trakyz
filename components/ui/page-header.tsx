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
}

export default function PageHeader({
  title,
  description,
  className = "mb-12",
  titleClassName = "text-4xl font-bold text-[var(--text-primary)] mb-4",
  descriptionClassName = "text-lg text-[var(--text-secondary)]"
}: PageHeaderProps) {
  return (
    <div className={className}>
      <h1 className={titleClassName}>{title}</h1>
      {description && (
        typeof description === 'string' 
          ? <p className={descriptionClassName}>{description}</p>
          : description
      )}
    </div>
  )
}