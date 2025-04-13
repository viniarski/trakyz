"use client";

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/client';
import Navigation from '@/components/ui/navigation';
import PageHeader from '@/components/ui/page-header';
import AccountSection from './components/account-section';
import CustomizationSection from './components/customization-section';
import SecuritySection from './components/security-section';
import SystemSection from './components/system-section';

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (!user) {
          return redirect('/sign-in');
        }
        
        setUser(user);
      } catch (error) {
        console.error('Error in settings page:', error);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--text-secondary)]">Loading settings...</span>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Navigation />
        <PageHeader 
          title="Settings" 
          description="Manage your account, appearance, and preferences"
        />
        
        {error && (
          <div className="bg-[var(--error-10)] border border-[var(--error-20)] rounded-lg p-4 mb-6">
            <p className="text-[var(--error-80)] text-sm">{error}</p>
          </div>
        )}
        
        <div className="space-y-8 mt-8">
          <AccountSection user={user} />
          <CustomizationSection />
          <SecuritySection />
          <SystemSection />
        </div>
      </div>
    </div>
  );
}