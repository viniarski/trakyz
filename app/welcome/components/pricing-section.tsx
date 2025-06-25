// app/welcome/components/pricing-section.tsx

'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { CtaButton } from '@/components/ui/cta'

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false) // Changed to false for monthly default
  const discount = 17 // Approximate discount from $9.99/month to $99/year
  
  const features = [
    "Unlimited asset tracking",
    "Advanced portfolio analytics",
    "All asset classes supported",
    "Budget management tools",
    "CSV, Excel, JSON & PDF import/export",
    "Multiple portfolios support",
    "Real-time market data",
    "Priority support"
  ]

  // Calculate pricing
  const monthlyPrice = 9.99
  const yearlyPrice = 99
  const displayPrice = isYearly ? yearlyPrice : monthlyPrice
  const displayPeriod = isYearly ? 'year' : 'month'
  const savings = isYearly ? ((monthlyPrice * 12) - yearlyPrice).toFixed(2) : '0'

  return (
    <div className="py-20 text-center" id="pricing">
      <h2 className="text-3xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
      <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
        Everything you need to optimize your investments with one subscription
      </p>
      
      {/* Replaced with in-card toggle */}
      
      <div className="max-w-md mx-auto bg-gray-800/50 backdrop-blur rounded-xl overflow-hidden border border-gray-700">
        <div className="p-8">
          {/* Sleek billing toggle inside card */}
          <div className="flex flex-col items-center mb-6">
            <div className="inline-flex items-center bg-gray-700/50 rounded-full p-1 mb-4 w-auto">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  !isYearly 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  isYearly 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Yearly <span className="text-xs ml-1">(Save 17%)</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-white">
                ${displayPrice}
              </span>
              <div className="flex flex-col items-start">
                <span className="text-gray-400 text-sm">/ {displayPeriod}</span>
                {isYearly && (
                  <span className="text-xs text-green-400">Save ${savings}</span>
                )}
              </div>
            </div>
          </div>
          
          <ul className="space-y-3 mb-8 text-left">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
          
          <CtaButton
            href="/sign-in"
            variant="primary"
            className="w-full py-3"
          >
            Subscribe
          </CtaButton>
          
          <p className="text-xs text-gray-400 mt-4 text-center">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-white mb-8">
          Frequently Asked Questions
        </h3>
        
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 text-left">
          <div>
            <h4 className="text-lg font-medium text-white mb-2">
              What's included in the subscription?
            </h4>
            <p className="text-gray-400">
              Your subscription includes all features available in Trakyz: unlimited asset tracking, advanced analytics, real-time market data, budget management, and more.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-white mb-2">
              Can I cancel my subscription?
            </h4>
            <p className="text-gray-400">
              Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access until the end of your billing period.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-white mb-2">
              Is my payment information secure?
            </h4>
            <p className="text-gray-400">
              Yes, all payments are processed securely through Stripe. We never store your credit card information on our servers.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-white mb-2">
              Do you offer a free trial?
            </h4>
            <p className="text-gray-400">
              Early adopters get 6 months completely free. After that, the regular subscription fee applies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}