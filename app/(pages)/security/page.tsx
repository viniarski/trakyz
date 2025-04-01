// app/security/page.tsx

'use client'

import Navigation from '@/components/ui/navigation'
import SecurityHeader from './components/security-header'
import SecurityOverview from './components/security-overview'
import SecurityFeatures from './components/security-features'
import SecurityPractices from './components/security-practices'
import SecurityUserRole from './components/security-user-role'
import SecurityCompliance from './components/security-compliance'

export default function Security() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Navigation />
        <SecurityHeader />
        <div className="space-y-16">
          <SecurityOverview />
          <SecurityFeatures />
          <SecurityPractices />
          <SecurityUserRole />
          <SecurityCompliance />
        </div>
      </div>
    </div>
  )
}