// app/(pages)/about/components/call-to-action.tsx

'use client'

import { CtaButton } from '@/components/ui/CTA'

export default function CallToAction() {
  return (
    <section className="text-center">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Learn More</h2>
      <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
        Curious about our features, security, or future plans? Explore more about Trakyz or get in touch with us.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <CtaButton href="/roadmap" variant="primary">
          View Roadmap
        </CtaButton>
        <CtaButton href="/contact" variant="secondary">
          Contact Us
        </CtaButton>
      </div>
    </section>
  )
}