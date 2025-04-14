// app/settings/components/security-section.tsx

'use client'

import { useState } from 'react'
import { Shield, Lock, AlertCircle, Check } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/utils/supabase/client'

export default function SecuritySection() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  
  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    try {
      setDeleting(true);
      setError(null);
      
      // Call API to delete account
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }
      
      // Sign out
      await supabase.auth.signOut();
      
      // Redirect to home page
      window.location.href = '/';
      
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-[var(--accent-primary)]" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Security</h2>
      </div>
      
      <div className="space-y-6">
        {/* Password section */}
        <div className="flex items-start gap-4">
          <Lock className="h-5 w-5 text-[var(--text-secondary)] mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-[var(--text-primary)]">Password</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Change your password regularly to ensure account security.
            </p>
            <Link
              href="/forgot-password"
              className="text-sm text-[var(--accent-primary)] hover:underline"
            >
              Change Password
            </Link>
          </div>
        </div>
        
        {/* Session section */}
        <div className="flex items-start gap-4">
          <Check className="h-5 w-5 text-green-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-[var(--text-primary)]">Current Session</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Your session is active on this device.
            </p>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/sign-in';
              }}
              className="text-sm text-[var(--accent-primary)] hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Delete account section */}
        <div className="pt-4 border-t border-[var(--bg-hover)]">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-[var(--text-primary)]">Delete Account</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              {error && (
                <p className="text-sm text-red-500 mb-3">{error}</p>
              )}
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Delete Account
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 bg-[var(--bg-hover)] text-[var(--text-primary)] text-sm rounded hover:bg-opacity-80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}