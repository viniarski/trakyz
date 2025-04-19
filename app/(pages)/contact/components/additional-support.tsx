// app/(pages)/contact/components/additional-support.tsx

'use client'

import { CtaButton } from '@/components/ui/cta'

export default function AdditionalSupport() {
  return (
    <section className="text-center">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Need More Help?</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Visit our Help Center for FAQs, guides, and additional resources.
      </p>
      <CtaButton href="/help" variant="secondary">
        Visit Help Center
      </CtaButton>
    </section>
  )
}