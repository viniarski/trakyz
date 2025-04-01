// app/security/components/security-contact.tsx

'use client'

import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function SecurityContact() {
  return (
    <section className="bg-[var(--bg-secondary)] rounded-xl p-6 text-center">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Report a Security Issue</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        If you discover a vulnerability or have security concerns, contact our team immediately.
      </p>
      
      {/* Email Link */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <Link
          href="mailto:support@trakyz.com"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-primary-20)] text-[var(--accent-primary)] rounded-xl hover:bg-[var(--accent-primary-30)] transition-all"
        >
          <Mail className="h-5 w-5" />
          Email Security Team
        </Link>
      </div>

      {/* Placeholder Contact Form */}
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Send Us a Message</h3>
        <form
          onSubmit={(e) => e.preventDefault()} // Prevents submission for now
          className="space-y-4"
        >
          <div>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-2 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary-80)]"
              disabled // Disabled until provider is added
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary-80)]"
              disabled
            />
          </div>
          <div>
            <textarea
              placeholder="Your Message"
              rows={4}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary-80)] resize-none"
              disabled
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-[var(--accent-primary-20)] text-[var(--accent-primary)] rounded-xl hover:bg-[var(--accent-primary-30)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            Send Message
          </button>
        </form>
        <p className="text-sm text-[var(--text-secondary)] mt-4">
          {/* Comment for future implementation */}
          {/* TODO: To enable this form, integrate a provider Web3Forms or a custom backend API */}
          Form submission is coming soon! For now, please use the email option above.
        </p>
      </div>

      <p className="text-sm text-[var(--text-secondary)] mt-6">
        We investigate all reports promptly and value your contribution to Trakyz&apos;s security.
      </p>
    </section>
  )
}