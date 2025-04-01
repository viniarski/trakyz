// app/(pages)/about/components/call-to-action.tsx

'use client'

import Link from 'next/link'

export default function CallToAction() {
  return (
    <section className="text-center">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Learn More</h2>
      <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
        Curious about our features, security, or future plans? Explore more about Trakyz or get in touch with us.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/roadmap"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-primary-20)] text-[var(--accent-primary)] rounded-xl hover:bg-[var(--accent-primary-30)] transition-all w-full sm:w-auto"
        >
          View Roadmap
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-hover)] transition-all w-full sm:w-auto"
        >
          Contact Us
        </Link>
      </div>
    </section>
  )
}