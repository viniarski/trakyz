// app/security/components/security-contact.tsx

'use client'

import { Mail } from 'lucide-react'
import { CtaButton } from '@/components/ui/cta'

export default function SecurityContact() {
  return (
    <section className="bg-[var(--bg-secondary)] rounded-xl p-6 text-center">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Report a Security Issue</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        If you discover a vulnerability or have security concerns, contact our team immediately.
      </p>
      
      {/* Email Link */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <CtaButton 
          href="mailto:security@trakyz.com" 
          variant="primary"
          iconRight={<Mail className="h-5 w-5" />}
        >
          Email Security Team
        </CtaButton>
      </div>

      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Security Response Policy</h3>
        <ul className="text-left space-y-2 text-[var(--text-secondary)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent-primary)]">•</span>
            <span>All reports are acknowledged within 24 hours</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent-primary)]">•</span>
            <span>Critical vulnerabilities are addressed within 48 hours</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent-primary)]">•</span>
            <span>We follow responsible disclosure practices</span>
          </li>
        </ul>
      </div>
    </section>
  )
}