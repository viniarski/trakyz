// app/(pages)/security/page.tsx

'use client'

import Navigation from '@/components/ui/navigation'
import PageHeader from '@/components/ui/page-header'
import SecurityOverview from './components/security-overview'
import SecurityFeatures from './components/security-features'
import SecurityPractices from './components/security-practices'
import SecurityUserRole from './components/security-user-role'
import SecurityCompliance from './components/security-compliance'
import SecurityContact from './components/security-contact'

export default function Security() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Navigation />
        <PageHeader 
          title="Security at Trakyz" 
          description="Protecting your data is our top priority. Learn how we secure your information with industry-leading partners and practices."
        />
        <div className="space-y-16">
          <SecurityOverview />
          <SecurityFeatures />
          <SecurityPractices />
          <SecurityUserRole />
          <SecurityCompliance />
          <SecurityContact />
        </div>
      </div>
    </div>
  )
}