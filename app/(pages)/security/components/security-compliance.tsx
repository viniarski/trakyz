// app/(pages)/security/components/security-compliance.tsx

'use client'

import Link from 'next/link'

export default function SecurityCompliance() {
  return (
    <section className="bg-[var(--bg-secondary)] rounded-xl p-6">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Compliance & Certifications</h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Trakyz benefits from the compliance of our providers:
      </p>
      <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2">
        <li>
          <strong>GDPR:</strong> Compliant via Supabase, Vercel, and Stripe&apos;s data protection measures, offering EEA/UK users rights like data deletion.
        </li>
        <li>
          <strong>SOC 2:</strong> Vercel, Supabase, and Stripe are SOC 2 certified, ensuring high security standards.
        </li>
        <li>
          <strong>Authentication Security:</strong> Our authentication system powered by Supabase Auth supports Email, Google, GitHub, X, and LinkedIn authentication with industry-standard security practices.
        </li>
      </ul>
      <p className="text-[var(--text-secondary)] mt-4">
        See our{' '}
        <Link href="/privacy" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">
          Privacy Policy
        </Link>{' '}
        for more details.
      </p>
    </section>
  )
}