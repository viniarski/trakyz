// app/(pages)/pricing/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";
import Navigation from "@/components/ui/navigation";
import { User } from "@supabase/supabase-js";
import { ChevronRight, Check } from "lucide-react";
import Link from "next/link";

const SUBSCRIPTION_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_placeholder";

function PricingPageContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, []);

  const handleSubscription = async () => {
    if (!user) {
      router.push('/sign-in?returnTo=/pricing');
      return;
    }

    setIsLoadingCheckout(true);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: SUBSCRIPTION_PRICE_ID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error initiating checkout:", error);
      setIsLoadingCheckout(false);
    }
  };

  // Features list
  const features = [
    "Unlimited asset tracking",
    "Advanced portfolio analytics",
    "All asset classes supported",
    "Budget management tools",
    "CSV/Excel import & export",
    "Multiple portfolios",
    "Real-time market data",
    "Priority support"
  ];

  // Show loading UI if checking session or initiating checkout
  if (loading || isLoadingCheckout) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--text-secondary)]">
            {loading ? "Loading..." : "Redirecting to checkout..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <main>
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">
              Trakyz Subscription
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl">
              Get access to all features with our simple subscription plan
            </p>
          </div>

          {/* Single Pricing Card */}
          <div className="max-w-md mx-auto bg-[var(--bg-secondary)] rounded-xl overflow-hidden border border-[var(--accent-primary-20)]">
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Trakyz</h2>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">Everything you need</p>
                </div>
                <div className="bg-[var(--accent-primary-10)] text-[var(--accent-primary)] text-xs font-medium px-3 py-1 rounded-full">
                  FULL ACCESS
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-[var(--text-primary)]">$9.99</span>
                <span className="text-[var(--text-secondary)]"> / month</span>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                  Or $99/year (Save 17%)
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSubscription}
                disabled={isLoadingCheckout}
                className="w-full py-3 rounded-lg transition-colors text-center font-medium bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white flex items-center justify-center gap-2"
              >
                {isLoadingCheckout ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {user ? "Subscribe Now" : "Sign Up & Subscribe"}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-[var(--text-secondary)] mt-4 text-center">
                Cancel anytime. No hidden fees.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  What's included in the subscription?
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Your subscription includes all features available in Trakyz: unlimited asset tracking, advanced analytics, real-time market data, budget management, and more. There are no feature restrictions or hidden costs.
                </p>
              </div>
              
              <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Can I cancel my subscription?
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access until the end of your billing period.
                </p>
              </div>
              
              <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Is my payment information secure?
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Yes, all payments are processed securely through Stripe. We never store your credit card information on our servers.
                </p>
              </div>
              
              <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Do you offer a free trial?
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Yes, we offer a 30-day free trial with full access to all features. No credit card required to try it out.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-20 text-center">
            <p className="text-[var(--text-secondary)] mb-4">
              Have more questions? We're here to help.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

// Main page component that wraps the content in a Suspense boundary
export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[var(--text-secondary)]">Loading...</span>
          </div>
        </div>
      }
    >
      <Navigation />
      <PricingPageContent />
    </Suspense>
  );
}