// app/privacy/page.tsx

'use client'

import Navigation from '@/components/ui/navigation'
import PrivacyHeader from './components/privacy-header'
import PrivacyContent from './components/privacy-content'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4">
        <Navigation />
        <PrivacyHeader />
        <PrivacyContent />
      </div>
    </div>
  )
}