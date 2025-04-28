// app/settings/components/subscription-section.tsx

'use client'

import { useState } from 'react'
import { CreditCard, Calendar, Receipt, Shield, DownloadCloud, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { User } from '@supabase/supabase-js'

interface SubscriptionSectionProps {
  user: User
  subscription: {
    status: string
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
    paymentMethod?: {
      brand?: string
      last4?: string
      expMonth?: number
      expYear?: number
    } | null
  } | null
}

export default function SubscriptionSection({ user, subscription }: SubscriptionSectionProps) {
  const [isManagingPayment, setIsManagingPayment] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showInvoices, setShowInvoices] = useState(false)
  
  // Example invoices - replace with actual data from your API
  const invoices = [
    { id: 'inv_123456', date: '2025-03-15', amount: 9.99, status: 'paid' },
    { id: 'inv_123455', date: '2025-02-15', amount: 9.99, status: 'paid' },
    { id: 'inv_123454', date: '2025-01-15', amount: 9.99, status: 'paid' },
  ]

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create portal session')
      }

      const data = await response.json()

      if (data.redirect) {
        window.location.href = data.redirect
      } else {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Error opening customer portal:', err)
      setMessage({ type: 'error', text: 'Failed to open customer portal' })
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true)

      // Call an API route to cancel the subscription
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      setMessage({
        type: 'success',
        text: 'Subscription will be canceled at the end of the billing period',
      })
      
      // Update local state to reflect change
      if (subscription) {
        subscription.cancelAtPeriodEnd = true
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      setMessage({ type: 'error', text: 'Failed to cancel subscription' })
    } finally {
      setIsCancelling(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="h-5 w-5 text-[var(--accent-primary)]" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Subscription & Billing</h2>
      </div>
      
      <div className="space-y-6">
        {/* Current Plan */}
        <div className="bg-[var(--bg-hover)]/30 p-5 rounded-lg border border-[var(--bg-hover)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-[var(--text-primary)]">Trakyz Subscription</h3>
            <div className="flex items-center">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                subscription?.status === 'active' 
                  ? 'bg-green-500/10 text-green-500' 
                  : subscription?.status === 'trialing'
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-gray-500/10 text-gray-500'
              }`}>
                {subscription?.status === 'active' 
                  ? 'Active' 
                  : subscription?.status === 'trialing' 
                    ? 'Trial' 
                    : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Price</span>
              <span className="text-[var(--text-primary)] font-medium">$9.99/month</span>
            </div>
            
            {subscription?.currentPeriodEnd && (
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Current period ends</span>
                <span className="text-[var(--text-primary)]">
                  {formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>
            )}
            
            {subscription?.cancelAtPeriodEnd && (
              <div className="flex items-center gap-1.5 text-yellow-500 mt-2">
                <Info className="h-4 w-4" />
                <span>Your subscription will not renew automatically</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Payment Method */}
        <div className="pt-4">
          <h3 className="flex items-center gap-2 font-medium text-[var(--text-primary)] mb-3">
            <Calendar className="h-4 w-4 text-[var(--accent-primary)]" />
            Payment Method
          </h3>
          
          {subscription?.paymentMethod ? (
            <div className="bg-[var(--bg-hover)]/30 p-4 rounded-lg border border-[var(--bg-hover)]">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">
                    {subscription.paymentMethod.brand?.toUpperCase() || 'Card'} •••• {subscription.paymentMethod.last4}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Expires {subscription.paymentMethod.expMonth}/{subscription.paymentMethod.expYear}
                  </p>
                </div>
                <Button 
                  onClick={() => setIsManagingPayment(true)}
                  variant="ghost"
                  size="sm"
                  className="text-[var(--accent-primary)]"
                >
                  Update
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--bg-hover)]/30 p-4 rounded-lg border border-[var(--bg-hover)] text-[var(--text-secondary)]">
              <p>No payment method on file</p>
            </div>
          )}
        </div>
        
        {/* Billing History */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
              <Receipt className="h-4 w-4 text-[var(--accent-primary)]" />
              Billing History
            </h3>
            <Button 
              onClick={() => setShowInvoices(!showInvoices)}
              variant="ghost"
              size="sm"
              className="text-[var(--text-secondary)]"
            >
              {showInvoices ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          {showInvoices && (
            <div className="bg-[var(--bg-hover)]/30 rounded-lg border border-[var(--bg-hover)] overflow-hidden">
              <div className="divide-y divide-[var(--bg-hover)]">
                {invoices.length > 0 ? (
                  invoices.map(invoice => (
                    <div key={invoice.id} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {formatDate(invoice.date)}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {invoice.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[var(--text-primary)]">
                          ${invoice.amount.toFixed(2)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          invoice.status === 'paid' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {invoice.status}
                        </span>
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                          <DownloadCloud className="h-4 w-4 text-[var(--text-secondary)]" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[var(--text-secondary)]">
                    <p>No billing history available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Subscription Management Buttons */}
        {(subscription?.status === 'active' || subscription?.status === 'trialing') && (
          <div className="pt-4 border-t border-[var(--bg-hover)]">
            <div className="flex flex-wrap gap-3 justify-between items-center">
              <Button
                onClick={handleManageSubscription}
                variant="outline"
                className="bg-[var(--bg-hover)]/50 text-[var(--text-primary)] border-[var(--bg-hover)]"
              >
                Manage Billing
              </Button>

              {!subscription.cancelAtPeriodEnd && (
                <Button
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  variant="ghost"
                  className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
                >
                  {isCancelling ? 'Processing...' : 'Cancel Subscription'}
                </Button>
              )}
            </div>
            
            {message && (
              <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {message.type === 'success' 
                  ? <CheckCircle className="h-4 w-4" /> 
                  : <AlertCircle className="h-4 w-4" />}
                <p className="text-sm">{message.text}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Security Note */}
        <div className="pt-4 border-t border-[var(--bg-hover)]">
          <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
            <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Your payment information is securely processed by Stripe. Trakyz never stores your complete credit card details on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}