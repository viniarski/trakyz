// app/contact/components/additional-support.tsx

'use client'

import Link from 'next/link'

export default function AdditionalSupport() {
  return (
    <section className="text-center">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Need More Help?</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Visit our Help Center for FAQs, guides, and additional resources.
      </p>
      <Link
        href="/help"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-hover)] transition-all w-full sm:w-auto"
      >
        Visit Help Center
      </Link>
    </section>
  )
}