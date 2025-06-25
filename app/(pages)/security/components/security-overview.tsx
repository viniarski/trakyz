// app/(pages)/security/components/security-overview.tsx

'use client'

export default function SecurityOverview() {
  return (
    <section className="bg-[var(--bg-secondary)] rounded-xl p-6">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Our Commitment to Security</h2>
      <p className="text-[var(--text-secondary)] mb-4">
        At Trakyz, safeguarding your financial data is our highest priority. We follow a zero-trust security approach, ensuring every access request is continuously verified and authenticated. Our system supports multiple secure authentication methods including Email, Google, GitHub, X, and LinkedIn, with options for two-factor authentication (2FA) and YubiKey support for additional protection.
      </p>
      <p className="text-[var(--text-secondary)]">
        We don&apos;t manage servers or process payments ourselves but rely on trusted third-party providers with proven security track records. For example, Stripe handles all payment transactions with PCI DSS compliance and end-to-end encryption. Additionally, we implement end-to-end encryption on our side, ensuring that even we do not have access to your sensitive data. Below, we outline how your information remains protected.
      </p>
    </section>
  )
}