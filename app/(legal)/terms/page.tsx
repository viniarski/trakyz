// app/(legal)/terms/page.tsx

'use client'

import Navigation from '@/components/ui/navigation'
import TermsHeader from './components/terms-header'
import TermsContent from './components/terms-content'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Navigation />
        <TermsHeader />
        <TermsContent />
      </div>
    </div>
  )
}