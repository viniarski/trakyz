// app/contact/components/contact-details.tsx

'use client'

import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function ContactDetails() {
  return (
    <section className="bg-[var(--bg-secondary)] rounded-xl p-6 text-center">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Get in Touch</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        For any questions or assistance, please email us directly. We&apos;re here to help!
      </p>
      <div className="flex justify-center items-center gap-3 mb-4">
        <Mail className="h-6 w-6 text-[var(--accent-primary)]" />
        <Link
          href="mailto:support@trakyz.com"
          className="text-xl text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors"
        >
          support@trakyz.com
        </Link>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        Response time: Typically within 24 hours.
      </p>
    </section>
  )
}