// app/(legal)/cookie-policy/page.tsx

'use client'

import Navigation from '@/components/ui/navigation'
import PageHeader from '@/components/ui/PageHeader'
import CookieContent from './components/cookie-content'

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4">
        <Navigation />
        <PageHeader 
          title="Cookie Policy" 
          description={
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Effective Date: February 23, 2025 | Last Updated: February 23, 2025
            </p>
          }
          descriptionClassName=""
          className="mb-8"
        />
        <CookieContent />
      </div>
    </div>
  )
}