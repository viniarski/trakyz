// app/settings/components/customization-section.tsx

'use client'

import { useState, useCallback, useMemo } from 'react'
import { Palette, ChevronDown } from 'lucide-react'
import { useThemeStore } from '@/lib/stores/useThemeStore'

export default function CustomizationSection() {
  const { theme, setTheme } = useThemeStore()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Memoized theme information to prevent recalculation
  const themes = useMemo(() => [
    { value: 'blue', name: 'Blue (Default)', color: 'rgb(59, 130, 246)' },
    { value: 'dark', name: 'Dark', color: '#222' },
    { value: 'light', name: 'Light', color: '#f5f5f5' }
  ], []);

  // Get current theme info
  const currentTheme = useMemo(() => 
    themes.find(t => t.value === theme) || themes[0], 
  [theme, themes]);

  // Memoize handler functions
  const handleThemeChange = useCallback(async (newTheme: 'blue' | 'dark' | 'light') => {
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
  }, [setTheme]);

  const toggleDropdown = useCallback(() => setIsOpen(prev => !prev), []);

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
            onClick={toggleDropdown}
          >
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ background: currentTheme.color }}
              ></div>
              {currentTheme.name}
            </div>
            <ChevronDown className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg shadow-lg overflow-hidden">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  type="button"
                  className="w-full px-3 py-2 text-left flex items-center hover:bg-[var(--bg-hover)] transition-colors"
                  onClick={() => handleThemeChange(themeOption.value as 'blue' | 'dark' | 'light')}
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-2 flex-shrink-0" 
                    style={{ background: themeOption.color }}
                  ></div>
                  <span className="flex-grow">{themeOption.name}</span>
                  {theme === themeOption.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"></div>
                  )}
                </button>
              ))}
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