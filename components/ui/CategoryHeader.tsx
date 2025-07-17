// components/ui/CategoryHeader.tsx

'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'

interface CategoryHeaderProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  isExpanded: boolean
  onToggle: () => void
  rightContent: React.ReactNode
}

export function CategoryHeader({
  icon,
  title,
  subtitle,
  isExpanded,
  onToggle,
  rightContent
}: CategoryHeaderProps) {
  return (
    <div 
      className="flex items-center justify-between cursor-pointer hover:bg-[var(--bg-hover)]/50 rounded-lg p-2 transition-colors border-b border-[var(--bg-hover)]"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <h2 className="text-sm font-medium text-[var(--text-primary)]">{title}</h2>
          <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>
        </div>
      </div>
      
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
  )
}