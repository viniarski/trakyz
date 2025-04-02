// app/welcome/components/navigation.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function Navigation() {
  return (
    <div className="pt-8 px-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link 
          href="/" 
          className="flex items-center gap-1 sm:gap-2 font-medium text-2xl sm:text-2xl text-white uppercase tracking-tight no-underline font-mono"
        >
          <div className="relative h-5 w-5">
            <Image 
              src="/logo_trakyz.png"
              alt="Trakyz Logo" 
              fill
              sizes="80px"
              className="object-contain object-left"
              priority
            />
          </div>
          TRAKYZ
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/pricing"
            className="text-gray-400 hover:text-white transition-colors hidden sm:block"
          >
            Pricing
          </Link>
          <Button 
            asChild 
            variant="ghost" 
            size="default"  // h-10 = 40px, matches original py-2
            className="bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-all"
          >
            <Link href="/sign-in">
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}