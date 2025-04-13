'use client'

import Link from 'next/link'
import { Zap, Clock, CheckCircle, Info, Calendar, CreditCard as CreditCardIcon } from 'lucide-react'

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

interface BillingSectionProps {
  subscription: SubscriptionData | null;
  isCreatingPortal: boolean;
  handleManageSubscription: () => Promise<void>;
}

export default function BillingSection({
  subscription,
  isCreatingPortal,
  handleManageSubscription
}: BillingSectionProps) {
  const isTrial = subscription?.subscription_status === 'trialing';
  const isActive = subscription?.subscription_status === 'active';
  const isInactive = !subscription || subscription.subscription_status === 'inactive' || subscription.subscription_status === 'canceled';
  
  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-5 w-5 text-[var(--accent-primary)]" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Billing & Subscription</h2>
      </div>

      {subscription ? (
        <div>
          {/* Subscription Status */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              {isActive ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : isTrial ? (
                <Clock className="h-5 w-5 text-[var(--accent-primary)]" />
              ) : subscription.subscription_status === 'past_due' ? (
                <Info className="h-5 w-5 text-yellow-500" />
              ) : (
                <Info className="h-5 w-5 text-[var(--text-secondary)]" />
              )}
              <span className="text-lg font-medium text-[var(--text-primary)]">
                {isTrial
                  ? 'Trial'
                  : isActive
                  ? subscription.cancel_at_period_end
                    ? 'Pro (Cancels at period end)'
                    : 'Pro Plan'
                  : subscription.subscription_status === 'past_due'
                  ? 'Pro (Payment Overdue)'
                  : subscription.subscription_status === 'canceled'
                  ? 'Free (Pro Canceled)'
                  : 'Free'}
              </span>
            </div>

            <div className="bg-[var(--bg-hover)]/30 p-4 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subscription.current_period_end && (
                <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                  <Calendar className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium block">Current Period Ends</span>
                    <span className="text-sm">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
              
              {subscription.payment_method && (
                <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                  <CreditCardIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium block">Payment Method</span>
                    <span className="text-sm">
                      {subscription.payment_method.brand} •••• {subscription.payment_method.last4} | Expires{' '}
                      {subscription.payment_method.exp_month}/{subscription.payment_method.exp_year}
                    </span>
                  </div>
                </div>
              )}
              
              {/* If subscription is canceled but still active */}
              {isActive && subscription.cancel_at_period_end && (
                <div className="col-span-1 sm:col-span-2 flex items-start gap-2 text-yellow-500">
                  <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium block">Subscription Canceled</span>
                    <span className="text-sm">
                      Your subscription will end on {new Date(subscription.current_period_end || '').toLocaleDateString()}. 
                      You'll still have access until then.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Actions */}
          <div className="flex flex-wrap gap-3">
            {(isActive || subscription.stripe_customer_id) && (
              <button
                onClick={handleManageSubscription}
                disabled={isCreatingPortal || isTrial}
                className={`bg-[var(--accent-primary)] text-white py-2 px-6 rounded-lg hover:bg-[var(--accent-primary-80)] transition-colors ${
                  isCreatingPortal || isTrial ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={isTrial ? "Cannot manage subscription during trial" : undefined}
              >
                {isCreatingPortal ? 'Loading...' : 'Manage Billing'}
              </button>
            )}
            
            {isInactive && (
              <Link
                href="/pricing"
                className="bg-[var(--accent-primary)] text-white py-2 px-6 rounded-lg hover:bg-[var(--accent-primary-80)] transition-colors"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
          
          {isTrial && (
            <p className="text-sm text-[var(--text-secondary)] mt-4">
              Your trial is active. You'll be able to manage your subscription when your trial ends or converts to a paid plan.
            </p>
          )}
        </div>
      ) : (
        <div className="text-[var(--text-secondary)]">
          <p>Current Plan: <span className="text-[var(--text-primary)] font-semibold">Free</span></p>
          <p className="text-sm mt-1">Upgrade to access premium features.</p>
          <Link
            href="/pricing"
            className="inline-block mt-4 bg-[var(--accent-primary)] text-white py-2 px-6 rounded-lg hover:bg-[var(--accent-primary-80)] transition-colors"
          >
            View Plans
          </Link>
        </div>
      )}
    </div>
  )
}