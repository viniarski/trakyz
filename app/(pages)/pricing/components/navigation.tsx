// app/(pages)/pricing/components/navigation.tsx

'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Navigation() {
  return (
    <div className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-lg">
      <div className="px-4 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back to Homepage</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </div>
    </div>
  )
}