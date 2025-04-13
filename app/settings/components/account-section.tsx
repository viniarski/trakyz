'use client'

import { useState } from 'react'
import { User, Mail, Key } from 'lucide-react'
import { createClient } from '@/lib/utils/supabase/client'
import Link from 'next/link'

interface AccountSectionProps {
  user: any;
}

export default function AccountSection({ user }: AccountSectionProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const supabase = createClient();
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName }
      });
      
      if (error) throw error;
      
      // Update user profile in database
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          name: displayName,
          updated_at: new Date().toISOString()
        });
      
      if (profileError) throw profileError;
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
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
        <User className="h-5 w-5 text-[var(--accent-primary)]" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Account</h2>
      </div>
      
      <div className="space-y-4">
        {/* Email display (non-editable) */}
        <div>
          <label className="text-sm text-[var(--text-secondary)]">Email</label>
          <div className="flex items-center mt-1">
            <div className="flex items-center gap-3 bg-[var(--bg-hover)] py-2 px-3 rounded-lg w-full">
              <Mail className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-[var(--text-primary)]">{user?.email}</span>
            </div>
          </div>
        </div>
        
        {/* Display name edit form */}
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label className="text-sm text-[var(--text-secondary)]">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full mt-1 bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--bg-hover)] focus:border-[var(--accent-primary)] rounded-lg py-2 px-3 outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary-80)] transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </button>
            
            {message && (
              <p className={`text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {message.text}
              </p>
            )}
          </div>
        </form>
        
        {/* Password change link */}
        <div className="pt-4 border-t border-[var(--bg-hover)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-[var(--text-primary)]">Password</span>
            </div>
            <Link
              href="/forgot-password"
              className="text-[var(--accent-primary)] hover:underline text-sm"
            >
              Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}