// app/roadmap/components/cta-section.tsx

'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CtaSection() {
  return (
    <section className="text-center mt-16">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Stay Updated</h2>
      <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
        Want to know when these features launch? Check back here or reach out to us for the latest updates on Trakyz&apos;s evolution.
      </p>
      <Link
        href="/contact"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary-20)] text-[var(--accent-primary)] rounded-xl hover:bg-[var(--accent-primary-30)] transition-all"
      >
        Contact Us
        <ArrowRight className="h-5 w-5" />
      </Link>
    </section>
  )
}