// app/(pages)/pricing/components/pricing-card.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface Feature {
  text: string;
  isProFeature?: boolean;
  highlight?: boolean;
}

type PricingCardProps = {
  title: string;
  description: string;
  price: string;
  features: Feature[];
  isPopular?: boolean;
  user: User | null;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
  isYearly?: boolean;
  setIsYearly?: (value: boolean) => void;
  showMobileToggle?: boolean;
};

export default function PricingCard({
  title,
  description,
  price,
  features,
  isPopular = false,
  user,
  monthlyPriceId,
  yearlyPriceId,
  isYearly = false,
  setIsYearly,
  showMobileToggle = false
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const monthlyPriceNum = parseFloat(price.replace('$', '')) || 0;
  const yearlyPriceNum = 99; // Fixed price for Pro Plan yearly
  const displayPrice = title === 'Pro Plan' && isYearly ? yearlyPriceNum : monthlyPriceNum;
  const displayPeriod = title === 'Pro Plan' && isYearly ? 'year' : 'month';
  const savings = title === 'Pro Plan' && isYearly ? '20.88' : '0'; // $9.99 * 12 - 99 = 20.88
  const discount = 17; // For mobile toggle display

  const handleUpgrade = async (priceId: string) => {
    if (!user) {
      const callbackUrl = encodeURIComponent(`/pricing?checkout=${priceId}&plan=${title.toLowerCase().replace(' ', '_')}`);
      window.location.href = `/sign-in?callbackUrl=${callbackUrl}`;
      return;
    }

    setIsLoading(true);
    try {
      console.log('Client user for upgrade:', user);
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId,
          planType: title.toLowerCase().replace(' ', '_')
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upgrade failed:', { status: response.status, errorData });
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-[var(--bg-secondary)] rounded-xl overflow-hidden border ${isPopular ? 'border-blue-500' : 'border-gray-700'} relative`}>
      {isPopular && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
          RECOMMENDED
        </div>
      )}
      <div className={`p-8 ${title === 'Free Plan' ? 'sm:pb-8 pb-4' : ''}`}>
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">{title}</h3>
        <p className="text-[var(--text-secondary)] mb-6">{description}</p>
        <div className="mb-6">
          <span className="text-4xl font-bold text-[var(--text-primary)]">
            ${displayPrice}
          </span>
          <span className="text-[var(--text-secondary)]"> / {displayPeriod}</span>
          {title === 'Pro Plan' && isYearly && (
            <span className="ml-2 text-sm bg-green-500/10 text-green-500 px-2 py-1 rounded">
              Save ${savings}
            </span>
          )}
        </div>

        {showMobileToggle && title === 'Pro Plan' && (
          <div className="sm:hidden flex justify-center mb-6">
            <div className="inline-flex items-center bg-[var(--bg-hover)] rounded-full p-1">
              <button
                onClick={() => setIsYearly && setIsYearly(false)}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  !isYearly ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly && setIsYearly(true)}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  isYearly ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)]'
                }`}
              >
                Yearly <span className="text-xs ml-1">({discount}%)</span>
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
              <div className="flex items-center">
                <span className={`text-[var(--text-secondary)] ${feature.highlight ? 'bg-blue-500/10 px-2 py-0.5 rounded' : ''}`}>
                  {feature.text}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {title !== 'Free Plan' && (
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleUpgrade(isYearly ? yearlyPriceId || '' : monthlyPriceId || '');
            }}
            className={`block w-full py-3 rounded-lg transition-colors text-center font-medium bg-blue-500 hover:bg-blue-600 text-white ${isLoading || !monthlyPriceId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {user ? `Upgrade to ${title}` : `Sign up for ${title}`}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Link>
        )}
      </div>
    </div>
  );
}