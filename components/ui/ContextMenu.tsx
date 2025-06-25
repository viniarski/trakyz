// components/ui/ContextMenu.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Star, Trash } from 'lucide-react'

interface AssetContextMenuProps {
  isInWatchlist: boolean
  onToggleWatchlist: () => void
}

export function AssetContextMenu({ isInWatchlist, onToggleWatchlist }: AssetContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    // Add event listener when menu is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-[var(--bg-secondary)] ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleWatchlist()
                setIsOpen(false)
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm text-left w-full hover:bg-[var(--bg-hover)] ${
                isInWatchlist ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
              }`}
            >
              {isInWatchlist ? (
                <>
                  <Trash className="h-4 w-4" />
                  Remove from Watchlist
                </>
              ) : (
                <>
                  <Star className="h-4 w-4" />
                  Add to Watchlist
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}