// app/(pages)/roadmap/page.tsx

'use client'

import Navigation from '@/components/ui/Navigation'
import PageHeader from '@/components/ui/PageHeader'
import FeatureList from './components/feature-list'

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Navigation />
        <PageHeader 
          title="Trakyz Roadmap" 
          description="Discover what's coming next for Trakyz as we innovate to enhance your investment experience."
        />
        <FeatureList />
      </div>
    </div>
  )
}