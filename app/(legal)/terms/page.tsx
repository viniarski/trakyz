// app/(legal)/terms/page.tsx

'use client'

import Navigation from '@/components/ui/Navigation'
import PageHeader from '@/components/ui/PageHeader'
import TermsContent from './components/terms-content'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Navigation />
        <PageHeader 
          title="Terms of Service" 
          description={
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Effective Date: February 23, 2025 | Last Updated: February 23, 2025
            </p>
          }
          descriptionClassName=""
          className="mb-8"
        />
        <TermsContent />
      </div>
    </div>
  )
}