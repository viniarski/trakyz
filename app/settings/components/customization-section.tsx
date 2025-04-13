'use client'

import { useState, useEffect } from 'react'
import { Palette } from 'lucide-react'
import { createClient } from '@/lib/utils/supabase/client'

export default function CustomizationSection() {
  const [themePreference, setThemePreference] = useState('blue');
  const [currency, setCurrency] = useState('USD');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const supabase = createClient();
  
  // Fetch user preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('theme_preference, selected_currency')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setThemePreference(profile.theme_preference || 'blue');
          setCurrency(profile.selected_currency || 'USD');
        }
      }
    };
    
    fetchPreferences();
  }, []);
  
  const updatePreferences = async () => {
    setIsUpdating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not found');
      
      // Update user profile in database
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          theme_preference: themePreference,
          selected_currency: currency,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Apply theme
      document.documentElement.setAttribute('data-theme', themePreference);
      
      setMessage({ type: 'success', text: 'Preferences updated successfully' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setIsUpdating(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="h-5 w-5 text-[var(--accent-primary)]" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Customization</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Theme selector */}
        <div>
          <label className="text-sm text-[var(--text-secondary)]">Theme</label>
          <select
            value={themePreference}
            onChange={(e) => setThemePreference(e.target.value)}
            className="w-full mt-1 bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
          >
            <option value="blue">Blue (Default)</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        
        {/* Currency selector */}
        <div>
          <label className="text-sm text-[var(--text-secondary)]">Preferred Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full mt-1 bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
          >
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
            <option value="CHF">Swiss Franc (₣)</option>
            <option value="BTC">Bitcoin (₿)</option>
            <option value="GOLD">Gold (XAU)</option>
          </select>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={updatePreferences}
          disabled={isUpdating}
          className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary-80)] transition-colors disabled:opacity-50"
        >
          {isUpdating ? 'Saving...' : 'Save Preferences'}
        </button>
        
        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
}