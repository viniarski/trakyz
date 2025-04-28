'use client'

import { CtaButtonWithArrow } from '@/components/ui/CTA'

export default function EarlyAdopterOffer() {
  return (
    <div className="mb-24 relative max-w-4xl mx-auto">
      {/* Position the badge to sit exactly on the border */}
      <div className="absolute top-0 right-12 -translate-y-1/2 z-20">
        <div className="bg-blue-500/10 border border-blue-500/40 text-blue-400 text-xs font-medium py-1 px-3 rounded-full">
          Limited Time Offer
        </div>
      </div>
      {/* Overlay to hide the border behind the badge */}
      <div className="absolute top-0 right-12 -translate-y-1/2 h-[2px] w-[132px] bg-[#01003d] z-10"></div>
    
      <div className="rounded-2xl p-8 border border-blue-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h2 className="text-xl md:text-xl text-white mt-6 mb-3">
              Early Adopters Special
            </h2>
            <p className="text-3xl md:text-4xl text-white mb-3">6 Months - FREE!</p>
            <div className="space-y-3 text-gray-400">
              <p className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                Full access to all features
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                Easy-to-use investment tracking
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                Priority support & feature requests
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <CtaButtonWithArrow href="/sign-in" className="whitespace-nowrap">
              Join Now
            </CtaButtonWithArrow>
          </div>
        </div>
      </div>
    </div>
  )
}