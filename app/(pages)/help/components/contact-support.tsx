// app/(pages)/help/components/contact-support.tsx

'use client'

import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function ContactSupport() {
  return (
    <section className="bg-[var(--bg-secondary)] rounded-xl p-6 text-center">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Still Need Help?</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Our support team is here to assist you. Reach out with any questions or issues.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500/30 transition-all w-full sm:w-auto"
        >
          <Mail className="h-5 w-5" />
          Contact Us
        </Link>
      </div>
    </section>
  )
}