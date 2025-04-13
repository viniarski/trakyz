// components/ui/navigation.tsx

'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Navigation() {
  return (
    <div className="mb-8 px-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Back to Dashboard</span>
        <span className="sm:hidden">Back</span>
      </Link>
    </div>
  )
}