// app/settings/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/client';
import Navigation from '@/components/ui/navigation';
import PageHeader from '@/components/ui/page-header';
import AccountSection from './components/account-section';
import CustomizationSection from './components/customization-section';
import BillingSection from './components/billing-section';
import SecuritySection from './components/security-section';
import SystemSection from './components/system-section';

interface SubscriptionData {
  subscription_status?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  payment_method?: {
    brand?: string;
    last4?: string;
    exp_month?: number;
    exp_year?: number;
  };
}

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isCreatingPortal, setIsCreatingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndSubscription = async () => {
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
        
        // Get user profile data
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }
        
        // Get subscription data
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subscriptionError);
        }
        
        setSubscription(subscriptionData || null);
        
      } catch (error) {
        console.error('Error in settings page:', error);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndSubscription();
  }, []);
  
  const handleManageSubscription = async () => {
    try {
      setIsCreatingPortal(true);
      setError(null);
      
      const response = await fetch('/api/stripe/create-portal', { 
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portal session');
      }
      
      const data = await response.json();
      
      if (data.redirect) {
        window.location.href = data.redirect; // Redirect to pricing if no customer ID
      } else {
        window.location.href = data.url; // Portal URL
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      setError(err instanceof Error ? err.message : 'Could not open billing portal');
    } finally {
      setIsCreatingPortal(false);
    }
  };

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
          description="Manage your account, subscription, and preferences"
        />
        
        {error && (
          <div className="bg-[var(--error-10)] border border-[var(--error-20)] rounded-lg p-4 mb-6">
            <p className="text-[var(--error-80)] text-sm">{error}</p>
          </div>
        )}
        
        <div className="space-y-8 mt-8">
          <AccountSection user={user} />
          <CustomizationSection />
          <BillingSection 
            subscription={subscription}
            isCreatingPortal={isCreatingPortal}
            handleManageSubscription={handleManageSubscription}
          />
          <SecuritySection />
          <SystemSection />
        </div>
      </div>
    </div>
  );
}