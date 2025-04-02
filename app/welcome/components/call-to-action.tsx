// app/welcome/components/call-to-action.tsx
'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CallToAction() {
  return (
    <div className="py-20 text-center">
      <h2 className="text-3xl font-bold text-white mb-6">
        Ready to Transform Your Investment Strategy?
      </h2>
      <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
        Join thousands of successful investors who are already using Trakyz to optimize their portfolios
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button 
          asChild 
          variant="ghost" 
          size="xxl"  // h-14 = 56px, matches original py-4
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500/30 transition-all group"
        >
          <Link href="/sign-in">
            Start Free Trial
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
        <Button 
          asChild 
          variant="secondary" 
          size="xxl"  // h-14 = 56px, matches original py-4
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all"
        >
          <Link href="/pricing">
            View Pricing
          </Link>
        </Button>
      </div>
    </div>
  )
}