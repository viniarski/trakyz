// app/cookie-policy/page.tsx

'use client'

import Navigation from '@/app/components/ui/navigation'
import CookieHeader from './components/cookie-header'
import CookieContent from './components/cookie-content'

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4">
        <Navigation />
        <CookieHeader />
        <CookieContent />
      </div>
    </div>
  )
}