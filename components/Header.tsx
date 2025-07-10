// components/Header.tsx

'use client'

import { ReactNode } from 'react'

interface HeaderProps {
  leftContent?: ReactNode
  rightContent?: ReactNode
  centerContent?: ReactNode
  className?: string
}

export function Header({ 
  leftContent, 
  rightContent, 
  centerContent,
  className = ""
}: HeaderProps) {
  return (
    <div className={className}>
      {/* Header with reduced padding and standardized layout */}
      <div className="px-4 py-3 flex justify-between items-center flex-wrap gap-y-2">
        {/* Left side - actions/buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {leftContent}
        </div>
        
        {/* Center content (optional) */}
        {centerContent && (
          <div className="flex items-center">
            {centerContent}
          </div>
        )}
        
        {/* Right side - controls/summary */}
        <div className="flex flex-wrap items-center gap-2">
          {rightContent}
        </div>
      </div>
      
      {/* Standardized border line - using the thicker Markets style */}
      <div className="border-t border-gray-800/50"></div>
    </div>
  )
}