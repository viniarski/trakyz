// app/(pages)/help/components/contact-support.tsx

'use client'

import { Mail } from 'lucide-react'
import { CtaButton } from '@/components/ui/cta'

export default function ContactSupport() {
  return (
    <section className="bg-[var(--bg-secondary)] rounded-xl p-6 text-center">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Still Need Help?</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Our support team is here to assist you. Reach out with any questions or issues.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <CtaButton 
          href="/contact" 
          variant="primary"
          iconRight={<Mail className="h-5 w-5" />}
        >
          Contact Us
        </CtaButton>
      </div>
    </section>
  )
}