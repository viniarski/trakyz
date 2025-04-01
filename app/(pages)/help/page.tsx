// app/(pages)/help/page.tsx

'use client'

import Navigation from '@/components/ui/navigation'
import PageHeader from '@/components/ui/page-header'
import QuickLinks from './components/quick-links'
import FAQSection from './components/faq'
import ContactSupport from './components/contact-support'
import AdditionalResources from './components/additional-resources'

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Navigation />
        <PageHeader 
          title="Help Center" 
          description="Find answers, resources, and support for using Trakyz effectively."
        />
        <div className="space-y-16">
          <QuickLinks />
          <FAQSection />
          <ContactSupport />
          <AdditionalResources />
        </div>
      </div>
    </div>
  )
}