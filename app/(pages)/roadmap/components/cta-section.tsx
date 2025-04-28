// app/(pages)/roadmap/components/cta-section.tsx

'use client'

import { CtaButtonWithArrow } from '@/components/ui/CTA'

export default function CtaSection() {
  return (
    <section className="text-center mt-16">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Stay Updated</h2>
      <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
        Want to know when these features launch? Check back here or reach out to us for the latest updates on Trakyz&apos;s evolution.
      </p>
      <CtaButtonWithArrow href="/contact">
        Contact Us
      </CtaButtonWithArrow>
    </section>
  )
}