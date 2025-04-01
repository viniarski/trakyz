// app/(pages)/pricing/page.tsx
'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Crown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Navigation from '@/components/ui/navigation'
import PricingCard from './components/pricing-card'
import { FAQ } from './components/faq'
import { FeatureComparison } from './components/feature-comparison'
import { User } from '@supabase/supabase-js'

const SUBSCRIPTION_PRICES = {
  MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
  YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_yearly_placeholder'
}

function PricingPageContent() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(true)
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)
  const [showHighlight, setShowHighlight] = useState(false)
  const [highlightedFeature, setHighlightedFeature] = useState('')
  const discount = 17 // Approximate discount from $9.99/month to $99/year
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  // Get highlighted feature name for display
  const getHighlightedFeatureName = useCallback(() => {
    switch (highlightedFeature) {
      case 'analytics':
        return 'Advanced Analytics';
      case 'budget':
        return 'Budget Management';
      case 'theme':
        return 'Custom Themes';
      default:
        return highlightedFeature ? `${highlightedFeature.charAt(0).toUpperCase()}${highlightedFeature.slice(1)}` : '';
    }
  }, [highlightedFeature])

  useEffect(() => {
    // Only run on client-side after mount
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const feature = urlParams.get('feature')
    if (feature) {
      setHighlightedFeature(feature)
      setShowHighlight(true)
      
      // Auto-hide the highlight after 5 seconds
      const timer = setTimeout(() => {
        setShowHighlight(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }

    const priceId = urlParams.get('checkout')
    const plan = urlParams.get('plan')
    const hasCheckoutIntent = !!priceId && !!plan && !!user

    if (hasCheckoutIntent && !isLoadingCheckout) {
      setIsLoadingCheckout(true)

      const initiateCheckout = async () => {
        try {
          const response = await fetch('/api/stripe/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              priceId,
              planType: plan
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to create checkout session')
          }

          const { url } = await response.json()
          window.location.href = url // Redirect to Stripe checkout
        } catch (error) {
          console.error('Error initiating checkout:', error)
          setIsLoadingCheckout(false) // Reset loading on error
          router.replace('/pricing') // Fallback to pricing page
        }
      }

      initiateCheckout()
    }
  }, [user, router, isLoadingCheckout, highlightedFeature])

  // Define pro features with highlighting
  const proFeatures = [
    { 
      text: "Unlimited assets tracking",
      isProFeature: false
    },
    { 
      text: "Advanced Analytics", 
      isProFeature: true,
      highlight: highlightedFeature === 'analytics'
    },
    { 
      text: "Budget Management", 
      isProFeature: true,
      highlight: highlightedFeature === 'budget'
    },
    { 
      text: "Custom Themes", 
      isProFeature: true,
      highlight: highlightedFeature === 'theme'
    },
    { 
      text: "Multiple Portfolios",
      isProFeature: false
    },
    { 
      text: "CSV / Excel / JSON / PDF import & export",
      isProFeature: false
    },
  ]

  // Show loading UI if checking session or initiating checkout
  if (loading || isLoadingCheckout) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--text-secondary)]">
            {loading ? 'Loading...' : 'Redirecting to checkout...'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <main>
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl">
              Start for free or upgrade to Pro for premium features
            </p>
            
            {/* Feature highlight notification */}
            {showHighlight && (
              <div className="mt-6 max-w-2xl bg-[var(--accent-primary-10)] text-[var(--accent-primary)] p-4 rounded-lg border border-[var(--accent-primary-20)] flex items-center">
                <Crown className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>
                  <strong>{getHighlightedFeatureName()}</strong> is a Pro feature. Upgrade to access it and other premium features.
                </p>
              </div>
            )}
            
            {/* Billing Toggle for Desktop (hidden on mobile) */}
            <div className="hidden sm:inline-flex items-center p-1 bg-[var(--bg-secondary)] rounded-lg mt-6">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !isYearly 
                    ? 'bg-[var(--accent-primary)] text-white' 
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isYearly 
                    ? 'bg-[var(--accent-primary)] text-white' 
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                Yearly <span className="text-xs ml-1">(Save {discount}%)</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <PricingCard
              title="Free Plan"
              description="Perfect for beginners or those with simple portfolio needs"
              price="$0"
              features={[
                { text: "Portfolio Tracking (up to 5 assets)" },
                { text: "Basic Transaction History" },
                { text: "Market Rate Monitoring" }
              ]}
              user={user}
              isYearly={isYearly}
            />
            <PricingCard
              title="Pro Plan"
              description="For serious investors who want powerful tracking tools"
              price="$9.99" // Base monthly price
              features={proFeatures}
              isPopular={true}
              user={user}
              monthlyPriceId={SUBSCRIPTION_PRICES.MONTHLY}
              yearlyPriceId={SUBSCRIPTION_PRICES.YEARLY}
              isYearly={isYearly}
              setIsYearly={setIsYearly}
              showMobileToggle
            />
          </div>
          <FeatureComparison />
          <FAQ />
        </main>
      </div>
    </div>
  )
}

// Main page component that wraps the content in a Suspense boundary
export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--text-secondary)]">Loading...</span>
        </div>
      </div>
    }>
      <Navigation />
      <PricingPageContent />
    </Suspense>
  )
}