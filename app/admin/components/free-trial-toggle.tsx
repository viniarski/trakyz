// app/admin/components/free-trial-toggle.tsx
'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/Switch'
import { createClient } from '@/lib/supabase/client'

export function FreeTrialToggle() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'free_trial_enabled')
          .single()
        
        if (!error && data?.value) {
          try {
            const parsedValue = typeof data.value === 'string' 
              ? JSON.parse(data.value) 
              : data.value
            
            setIsEnabled(parsedValue.enabled === true)
          } catch (e) {
            console.error('Error parsing free_trial_enabled value:', e)
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSettings()
  }, [])

  const handleToggle = async (newState: boolean) => {
    try {
      setIsSaving(true)
      const supabase = createClient()
      
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', 'free_trial_enabled')
        .single()
      
      if (existing) {
        await supabase
          .from('system_settings')
          .update({ 
            value: JSON.stringify({ enabled: newState }),
            updated_at: new Date().toISOString() 
          })
          .eq('key', 'free_trial_enabled')
      } else {
        await supabase
          .from('system_settings')
          .insert({
            key: 'free_trial_enabled',
            value: JSON.stringify({ enabled: newState }),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }
      
      setIsEnabled(newState)
    } catch (error) {
      console.error('Error saving setting:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Free Trial Program</h2>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[var(--text-primary)] font-medium mb-2">Enable 30-Day Free Trial for New Users</h3>
            <p className="text-[var(--text-secondary)] text-sm">
              When enabled, all new users receive 30 days of Pro access for free without requiring payment details.
              {isEnabled ? (
                <span className="text-green-500 block mt-1">Currently active</span>
              ) : (
                <span className="text-red-500 block mt-1">Currently disabled</span>
              )}
            </p>
            <div className="mt-4 text-xs text-[var(--text-secondary)]">
              <p>Note: Disabling this will not affect users who already started their trial, only new sign-ups.</p>
            </div>
          </div>
          <div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={isLoading || isSaving}
            />
            {isSaving && (
              <div className="text-xs text-[var(--text-secondary)] mt-2 text-center">
                Saving...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}