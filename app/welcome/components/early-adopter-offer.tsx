// app/welcome/components/early-adopter-offer.tsx
'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EarlyAdopterOffer() {
  return (
    <div className="mb-24 relative">
      <div className="rounded-2xl p-8 border border-blue-500/20">
        <div className="absolute -top-2 right-4 px-2 py-px bg-blue-400 text-black text-sm font-semibold uppercase tracking-wider border border-blue-400/30 rounded-md">
          Limited Time Offer
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h2 className="text-xl md:text-xl text-white mt-6 mb-3">
              Early Adopters Special
            </h2>
            <p className="text-3xl md:text-4xl text-white mb-3">Pro Plan 6 months - FREE!</p>
            <div className="space-y-3 text-gray-400">
              <p className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                Unlimited assets & portfolios
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                Early access to new features
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                Priority support & feature requests
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 md:min-w-[300px]">
            <Button 
              asChild 
              variant="ghost" 
              size="xl"  // h-12 = 48px, matches original py-3
              className="inline-flex items-center justify-between gap-2 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500/30 w-[9.375rem] hover:w-[12.8125rem] active:w-[16.25rem] transition-all duration-300 ease-out group whitespace-nowrap"
            >
              <Link href="/sign-in">
                <span>Join Now</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-4 transition-transform duration-300 ease-out" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}