// app/contact/page.tsx

'use client'

import Navigation from '@/components/ui/navigation'
import ContactHeader from './components/contact-header'
import ContactForm from './components/contact-form'
import AdditionalSupport from './components/additional-support'

export default function Contact() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Navigation />
        <ContactHeader />
        <div className="space-y-16">
          <ContactForm />
          <AdditionalSupport />
        </div>
      </div>
    </div>
  )
}