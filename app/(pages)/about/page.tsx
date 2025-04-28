// app/(pages)/about/page.tsx

'use client'

import Navigation from '@/components/ui/Navigation'
import PageHeader from '@/components/ui/PageHeader'
import AboutOverview from './components/about-overview'
import MissionVision from './components/mission-vision'
import CallToAction from './components/call-to-action'

export default function About() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Navigation />
        <PageHeader 
          title="About Trakyz" 
          description="Empowering investors with cutting-edge portfolio management tools."
        />
        <div className="space-y-16">
          <AboutOverview />
          <MissionVision />
          <CallToAction />
        </div>
      </div>
    </div>
  )
}