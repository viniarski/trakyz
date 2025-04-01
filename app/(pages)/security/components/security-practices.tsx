// app/security/components/security-practices.tsx

'use client'

export default function SecurityPractices() {
  return (
    <section className="bg-[var(--bg-secondary)] rounded-xl p-6">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Our Security Practices</h2>
      <ul className="space-y-4 text-[var(--text-secondary)]">
        <li className="flex items-start gap-3">
          <span className="text-[var(--accent-primary)]">•</span>
          <div>
            <strong>Third-Party Oversight:</strong> We regularly review Vercel, Supabase, and Stripe&apos;s security certifications and compliance reports. Vercel&apos;s firewall offers network-wide Layer 3 and Layer 4 protection, automatically mitigating DDoS threats and TCP-based attacks before they can reach applications.
            Vercel&apos;s WAF provides comprehensive Layer 7 security, identifying and mitigating threats like SQL injection, cross-site scripting (XSS), and bot-driven attacks, all without degrading performance.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-[var(--accent-primary)]">•</span>
          <div>
            <strong>Development Security:</strong> Our Next.js code undergoes security reviews to prevent vulnerabilities like XSS or CSRF.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-[var(--accent-primary)]">•</span>
          <div>
            <strong>Incident Response:</strong> We maintain a plan to address breaches, leveraging Vercel, Supabase, and Stripe support, with prompt user notification as required.
          </div>
        </li>
      </ul>
    </section>
  )
}