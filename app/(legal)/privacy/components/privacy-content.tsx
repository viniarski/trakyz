// app/privacy/components/privacy-content.tsx

'use client'

import Link from 'next/link'

export default function PrivacyContent() {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6 space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">1. Introduction</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          Trakyz (&quot;Trakyz&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use the Trakyz website, platform, and related services (collectively, the &quot;Service&quot;), hosted on Vercel with data stored via Supabase. By using the Service, you consent to the practices described herein. If you do not agree, please discontinue use of the Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">2. Information We Collect</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          <strong>We primarily collect only your email address</strong> for account identification. All user data stored in our systems is fully encrypted for your security. Specifically, we collect:
        </p>
        <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
          <li><strong>Authentication Data</strong>: When you log in via Google, X, LinkedIn, GitHub, Apple, Microsoft, or email, we collect only your email address. When using third-party authentication providers, we receive only the minimal necessary account information required to create your Trakyz account.</li>
          <li><strong>Portfolio Data</strong>: Information about your investments that you input into the Service is fully encrypted and stored securely on Supabase.</li>
          <li><strong>Financial Account Data</strong>: When you choose to connect external financial accounts, this data is fully encrypted. We do not store your financial account credentials.</li>
          <li><strong>Usage Data</strong>: Basic anonymized data such as browser type and pages visited for service optimization, processed via Vercel analytics.</li>
          <li><strong>Cookies and Tracking</strong>: Limited data collected via cookies and similar technologies (see our{' '}
            <Link href="/cookie-policy" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">Cookie Policy</Link>).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">3. How We Use Your Information</h2>
        <p className="text-[var(--text-secondary)] text-sm">We use your information for the following purposes:</p>
        <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
          <li>To provide, maintain, and improve the Service.</li>
          <li>To process transactions and manage your account via Supabase.</li>
          <li>To communicate with you about service updates and product announcements.</li>
          <li>To analyze usage patterns via Vercel analytics and enhance user experience.</li>
          <li>To detect, prevent, and address technical issues or security breaches.</li>
          <li>To comply with legal obligations.</li>
        </ul>
        <p className="text-[var(--text-secondary)] mt-2 text-sm">
          <strong>We do not sell, rent, or trade your personal information to third parties under any circumstances.</strong> All of your data is encrypted, and we minimize the information we collect to only what is necessary to provide our service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">4. Information Sharing and Disclosure</h2>
        <p className="text-[var(--text-secondary)] text-sm">We may share your encrypted information as follows:</p>
        <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
          <li><strong>Service Providers</strong>: With Vercel (hosting) and Supabase (database), who process encrypted data on our behalf under strict security and confidentiality agreements.</li>
          <li><strong>Financial Data Aggregators</strong>: With trusted financial data providers to securely connect your external financial accounts when you choose to connect them.</li>
          <li><strong>Authentication Providers</strong>: With Google, X, LinkedIn, GitHub, Apple, and Microsoft to facilitate login, subject to their respective privacy policies.</li>
          <li><strong>Legal Compliance</strong>: When required by law, regulation, or legal process.</li>
        </ul>
        <p className="text-[var(--text-secondary)] mt-2 text-sm">
          <strong>We do not and will never sell or rent your personal information to third parties for any purpose.</strong> Your data belongs to you, and we respect that principle in all our operations.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">5. Data Security</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          <strong>All data stored in our systems is fully encrypted</strong> using industry-standard encryption methods. We implement comprehensive technical and organizational measures to protect your personal information:
        </p>
        <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
          <li>End-to-end encryption for all personal and financial data.</li>
          <li>Encryption of data in transit using TLS/SSL protocols.</li>
          <li>Encryption of sensitive data at rest using AES-256 encryption.</li>
          <li>Regular security assessments and penetration testing.</li>
          <li>Access controls and strict authentication procedures.</li>
          <li>Continuous monitoring for unauthorized access attempts.</li>
        </ul>
        <p className="text-[var(--text-secondary)] mt-2 text-sm">
          We rely on Vercel and Supabase for infrastructure security. Additionally, Trakyz supports multi-factor authentication via our authentication providers (Google, X, LinkedIn, GitHub, Apple, and Microsoft) for enhanced account security.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">6. Your Rights and Choices</h2>
        <p className="text-[var(--text-secondary)] text-sm">Depending on your jurisdiction, you may have the following rights:</p>
        <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
          <li><strong>Access</strong>: Right to request information about the personal data we process about you.</li>
          <li><strong>Rectification</strong>: Right to request correction of inaccurate or incomplete personal data.</li>
          <li><strong>Erasure</strong>: Right to request deletion of your personal data.</li>
          <li><strong>Restriction</strong>: Right to request that we temporarily or permanently stop processing your personal data.</li>
          <li><strong>Data Portability</strong>: Right to request a copy of your personal data in a structured, machine-readable format.</li>
          <li><strong>Objection</strong>: Right to object to processing of your personal data.</li>
          <li><strong>Withdraw Consent</strong>: Right to withdraw consent where processing is based on your consent.</li>
        </ul>
        <p className="text-[var(--text-secondary)] mt-2 text-sm">
          To exercise these rights, contact us at{' '}
          <Link href="/contact" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">support@trakyz.com</Link>.
          We will respond within applicable legal timeframes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">7. Data Retention</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          We retain your encrypted personal information only for as long as:
        </p>
        <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
          <li>Your account remains active;</li>
          <li>Necessary to provide you with the Service;</li>
          <li>Required to fulfill legal obligations.</li>
        </ul>
        <p className="text-[var(--text-secondary)] mt-2 text-sm">
          When you delete your account, we will delete your personal information within 30 days, unless longer retention is required by law.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">8. International Data Transfers</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          Your encrypted information may be transferred to and processed in countries other than your country of residence, including where our servers and those of our service providers are located. These countries may have different data protection laws.
        </p>
        <p className="text-[var(--text-secondary)] mt-2 text-sm">
          When transferring personal data internationally, we implement appropriate safeguards such as Standard Contractual Clauses approved by regulatory authorities.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">9. Children&apos;s Privacy</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          The Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected such information, we will take steps to delete it promptly.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">10. Third-Party Links and Services</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          Our Service may contain links to third-party websites or services that are not owned or controlled by Trakyz. We are not responsible for the privacy practices or content of these third parties.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">11. Specific Privacy Rights by Region</h2>
        
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-4 mb-2">California Residents</h3>
        <p className="text-[var(--text-secondary)] text-sm">
          If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA).
        </p>
        <p className="text-[var(--text-secondary)] mt-2 text-sm">
          <strong>Trakyz does not sell personal information under any circumstances</strong>, so the right to opt-out of sale does not apply to our Service.
        </p>
        
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-4 mb-2">European Economic Area (EEA) Residents</h3>
        <p className="text-[var(--text-secondary)] text-sm">
          If you are in the EEA, you have rights under the General Data Protection Regulation (GDPR) as outlined in the &quot;Your Rights and Choices&quot; section.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">12. Changes to This Policy</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated policy here or via email before they take effect.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">13. Contact Us</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          If you have any questions about this Privacy Policy or our privacy practices, please contact us at:{' '}
          <Link href="/contact" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">
            support@trakyz.com
          </Link>
        </p>
        <p className="text-[var(--text-secondary)] mt-4 text-sm italic">
          Last Updated: March 10, 2025
        </p>
      </section>
    </div>
  )
}