'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function EarlyAdopterOffer() {
  return (
    <div className="mb-24 relative">
      <div className="rounded-2xl p-8 border border-blue-500/20">
        <div className="absolute -top-3 right-8 px-4 py-1 bg-blue-500 text-white text-sm rounded-full">
          Limited Time Offer
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Early Adopters Special
            </h2>
            <div className="space-y-3 text-gray-400">
              <p className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                Pro Plan for 6 months - FREE!
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
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500/30 transition-all group whitespace-nowrap"
            >
              Join Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}