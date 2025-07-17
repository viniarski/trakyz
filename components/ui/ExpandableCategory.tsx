// components/ui/ExpandableCategory.tsx

'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'
import { ReactNode } from 'react'

interface ExpandableCategoryProps {
  icon: ReactNode
  title: string
  subtitle: string
  isExpanded: boolean
  onToggle: () => void
  rightContent: ReactNode
  children?: ReactNode
}

export function ExpandableCategory({
  icon,
  title,
  subtitle,
  isExpanded,
  onToggle,
  rightContent,
  children
}: ExpandableCategoryProps) {
  return (
    <div className="bg-[var(--bg-hover)]/50 rounded-xl px-2 sm:px-3 md:px-3 py-2 md:py-1">
      {/* Category Header - Make entire header clickable */}
      <div 
        className="flex items-center justify-between pb-2 border-b border-gray-700 cursor-pointer gap-3"
        onClick={onToggle}
      >
        {/* Left side - Category info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {icon}
          <div>
            <h3 className="text-sm sm:text-base text-[var(--text-primary)] font-medium">{title}</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{subtitle}</p>
          </div>
        </div>

        {/* Right side - metrics and chevron */}
        <div className="flex items-center gap-8">
          {rightContent}
          
          {/* Chevron */}
          <div className="flex items-center justify-center">
            {isExpanded ? 
              <ChevronUp className="h-4 w-4 text-[var(--text-secondary)]" /> : 
              <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
            }
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && children}
    </div>
  )
}