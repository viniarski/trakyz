// app/welcome/components/hero-section.tsx

'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
      <Button 
        asChild 
        variant="ghost" 
        size="xxl"  // h-14 = 56px, matches original py-4
        className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500/30 transition-all group"
      >
        <Link href="/sign-in">
          Get Started
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </div>
  )
}