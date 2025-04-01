// app/roadmap/page.tsx

'use client'

import Navigation from '@/components/ui/navigation'
import RoadmapHeader from './components/roadmap-header'
import FeatureList from './components/feature-list'

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Navigation />
        <RoadmapHeader />
        <FeatureList />
      </div>
    </div>
  )
}