// app/welcome/components/hero-section.tsx

'use client'

import { CtaButtonWithArrow } from '@/components/ui/cta'

export default function HeroSection() {
  return (
    <div className="py-20 md:py-32 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
        Your Investment Portfolio,{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
          Reimagined
        </span>
      </h1>
      <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
        Track, analyze, and optimize your investments across multiple asset classes with powerful analytics and real-time market data
      </p>
      <CtaButtonWithArrow href="/sign-in" className="py-4">
        Get Started
      </CtaButtonWithArrow>
    </div>
  )
}