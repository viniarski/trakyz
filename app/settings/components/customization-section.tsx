'use client'

import { useState } from 'react'
import { Palette, ChevronDown } from 'lucide-react'
import { useThemeStore } from '@/lib/stores/useThemeStore'

export default function CustomizationSection() {
  const { theme, setTheme } = useThemeStore()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeChange = async (newTheme: 'blue' | 'dark' | 'light') => {
    try {
      setTheme(newTheme)
      setMessage({ type: 'success', text: 'Theme updated successfully' })
      setIsOpen(false)
      
      // Message disappears after 3 seconds
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Error updating theme:', error)
      setMessage({ type: 'error', text: 'Failed to update theme' })
    }
  }

  const getThemeColor = (themeValue: string) => {
    switch(themeValue) {
      case 'blue': return 'rgb(59, 130, 246)' // Blue theme color
      case 'dark': return '#222' // Dark theme color
      case 'light': return '#f5f5f5' // Light theme color
      default: return 'rgb(59, 130, 246)'
    }
  }

  const getThemeName = (themeValue: string) => {
    switch(themeValue) {
      case 'blue': return 'Blue (Default)'
      case 'dark': return 'Dark'
      case 'light': return 'Light'
      default: return 'Blue (Default)'
    }
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="h-5 w-5 text-[var(--accent-primary)]" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Customization</h2>
      </div>
      
      <div>
        <label className="text-sm text-[var(--text-secondary)] mb-1 block">Theme</label>
        
        {/* Custom dropdown with color dots inside */}
        <div className="relative">
          <button
            type="button"
            className="w-full bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors flex items-center justify-between"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ background: getThemeColor(theme) }}
              ></div>
              {getThemeName(theme)}
            </div>
            <ChevronDown className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg shadow-lg overflow-hidden">
              <button
                type="button"
                className="w-full px-3 py-2 text-left flex items-center hover:bg-[var(--bg-hover)] transition-colors"
                onClick={() => handleThemeChange('blue')}
              >
                <div 
                  className="w-4 h-4 rounded-full mr-2 flex-shrink-0" 
                  style={{ background: getThemeColor('blue') }}
                ></div>
                <span className="flex-grow">Blue (Default)</span>
                {theme === 'blue' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"></div>
                )}
              </button>
              <button
                type="button"
                className="w-full px-3 py-2 text-left flex items-center hover:bg-[var(--bg-hover)] transition-colors"
                onClick={() => handleThemeChange('dark')}
              >
                <div 
                  className="w-4 h-4 rounded-full mr-2 flex-shrink-0" 
                  style={{ background: getThemeColor('dark') }}
                ></div>
                <span className="flex-grow">Dark</span>
                {theme === 'dark' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"></div>
                )}
              </button>
              <button
                type="button"
                className="w-full px-3 py-2 text-left flex items-center hover:bg-[var(--bg-hover)] transition-colors"
                onClick={() => handleThemeChange('light')}
              >
                <div 
                  className="w-4 h-4 rounded-full mr-2 flex-shrink-0" 
                  style={{ background: getThemeColor('light') }}
                ></div>
                <span className="flex-grow">Light</span>
                {theme === 'light' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"></div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {message && (
        <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}