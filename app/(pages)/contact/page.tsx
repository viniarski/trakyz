// app/(pages)/contact/page.tsx

'use client'

import Navigation from '@/components/ui/navigation'
import PageHeader from '@/components/ui/page-header'
import ContactForm from './components/contact-form'
import AdditionalSupport from './components/additional-support'

export default function Contact() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Navigation />
        <PageHeader 
          title="Contact Us" 
          description="Reach out to the Trakyz team for support, feedback, or inquiries."
        />
        <div className="space-y-16">
          <ContactForm />
          <AdditionalSupport />
        </div>
      </div>
    </div>
  )
}