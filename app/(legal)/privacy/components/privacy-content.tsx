// app/(legal)/privacy/components/privacy-content.tsx

'use client'

import Link from 'next/link'
import LegalDocument, { LegalParagraph, LegalList, type LegalSection } from '@/app/(legal)/components/legal-document'

export default function PrivacyContent() {
  const sections: LegalSection[] = [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: (
        <LegalParagraph>
          Trakyz (&quot;Trakyz&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use the Trakyz website, platform, and related services (collectively, the &quot;Service&quot;), hosted on Vercel with data stored via Supabase. By using the Service, you consent to the practices described herein. If you do not agree, please discontinue use of the Service.
        </LegalParagraph>
      )
    },
    {
      id: 'information-we-collect',
      title: '2. Information We Collect',
      content: (
        <>
          <LegalParagraph>
            <strong>We primarily collect only your email address</strong> for account identification. All user data stored in our systems is fully encrypted for your security. Specifically, we collect:
          </LegalParagraph>
          <LegalList items={[
            <>
              <strong>Authentication Data</strong>: When you log in via Google, X, LinkedIn, GitHub, Apple, Microsoft, or email, we collect only your email address. When using third-party authentication providers, we receive only the minimal necessary account information required to create your Trakyz account.
            </>,
            <>
              <strong>Portfolio Data</strong>: Information about your investments that you input into the Service is fully encrypted and stored securely on Supabase.
            </>,
            <>
              <strong>Financial Account Data</strong>: When you choose to connect external financial accounts, this data is fully encrypted. We do not store your financial account credentials.
            </>,
            <>
              <strong>Usage Data</strong>: Basic anonymized data such as browser type and pages visited for service optimization, processed via Vercel analytics.
            </>,
            <>
              <strong>Cookies and Tracking</strong>: Limited data collected via cookies and similar technologies (see our{' '}
              <Link href="/cookie-policy" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">Cookie Policy</Link>).
            </>
          ]}/>
        </>
      )
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Your Information',
      content: (
        <>
          <LegalParagraph>We use your information for the following purposes:</LegalParagraph>
          <LegalList items={[
            'To provide, maintain, and improve the Service.',
            'To process transactions and manage your account via Supabase.',
            'To communicate with you about service updates and product announcements.',
            'To analyze usage patterns via Vercel analytics and enhance user experience.',
            'To detect, prevent, and address technical issues or security breaches.',
            'To comply with legal obligations.'
          ]}/>
          <LegalParagraph className="mt-2">
            <strong>We do not sell, rent, or trade your personal information to third parties under any circumstances.</strong> All of your data is encrypted, and we minimize the information we collect to only what is necessary to provide our service.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'information-sharing',
      title: '4. Information Sharing and Disclosure',
      content: (
        <>
          <LegalParagraph>We may share your encrypted information as follows:</LegalParagraph>
          <LegalList items={[
            <><strong>Service Providers</strong>: With Vercel (hosting) and Supabase (database), who process encrypted data on our behalf under strict security and confidentiality agreements.</>,
            <><strong>Financial Data Aggregators</strong>: With trusted financial data providers to securely connect your external financial accounts when you choose to connect them.</>,
            <><strong>Authentication Providers</strong>: With Google, X, LinkedIn, GitHub, Apple, and Microsoft to facilitate login, subject to their respective privacy policies.</>,
            <><strong>Legal Compliance</strong>: When required by law, regulation, or legal process.</>
          ]}/>
          <LegalParagraph className="mt-2">
            <strong>We do not and will never sell or rent your personal information to third parties for any purpose.</strong> Your data belongs to you, and we respect that principle in all our operations.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'data-security',
      title: '5. Data Security',
      content: (
        <>
          <LegalParagraph>
            <strong>All data stored in our systems is fully encrypted</strong> using industry-standard encryption methods. We implement comprehensive technical and organizational measures to protect your personal information:
          </LegalParagraph>
          <LegalList items={[
            'End-to-end encryption for all personal and financial data.',
            'Encryption of data in transit using TLS/SSL protocols.',
            'Encryption of sensitive data at rest using AES-256 encryption.',
            'Regular security assessments and penetration testing.',
            'Access controls and strict authentication procedures.',
            'Continuous monitoring for unauthorized access attempts.'
          ]}/>
          <LegalParagraph className="mt-2">
            We rely on Vercel and Supabase for infrastructure security. Additionally, Trakyz supports multi-factor authentication via our authentication providers (Google, X, LinkedIn, GitHub, Apple, and Microsoft) for enhanced account security.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'your-rights',
      title: '6. Your Rights and Choices',
      content: (
        <>
          <LegalParagraph>Depending on your jurisdiction, you may have the following rights:</LegalParagraph>
          <LegalList items={[
            <><strong>Access</strong>: Right to request information about the personal data we process about you.</>,
            <><strong>Rectification</strong>: Right to request correction of inaccurate or incomplete personal data.</>,
            <><strong>Erasure</strong>: Right to request deletion of your personal data.</>,
            <><strong>Restriction</strong>: Right to request that we temporarily or permanently stop processing your personal data.</>,
            <><strong>Data Portability</strong>: Right to request a copy of your personal data in a structured, machine-readable format.</>,
            <><strong>Objection</strong>: Right to object to processing of your personal data.</>,
            <><strong>Withdraw Consent</strong>: Right to withdraw consent where processing is based on your consent.</>
          ]}/>
          <LegalParagraph className="mt-2">
            To exercise these rights, contact us at{' '}
            <Link href="/contact" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">support@trakyz.com</Link>.
            We will respond within applicable legal timeframes.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'data-retention',
      title: '7. Data Retention',
      content: (
        <>
          <LegalParagraph>
            We retain your encrypted personal information only for as long as:
          </LegalParagraph>
          <LegalList items={[
            'Your account remains active;',
            'Necessary to provide you with the Service;',
            'Required to fulfill legal obligations.'
          ]}/>
          <LegalParagraph className="mt-2">
            When you delete your account, we will delete your personal information within 30 days, unless longer retention is required by law.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'international-transfers',
      title: '8. International Data Transfers',
      content: (
        <>
          <LegalParagraph>
            Your encrypted information may be transferred to and processed in countries other than your country of residence, including where our servers and those of our service providers are located. These countries may have different data protection laws.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            When transferring personal data internationally, we implement appropriate safeguards such as Standard Contractual Clauses approved by regulatory authorities.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'childrens-privacy',
      title: '9. Children&apos;s Privacy',
      content: (
        <LegalParagraph>
          The Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected such information, we will take steps to delete it promptly.
        </LegalParagraph>
      )
    },
    {
      id: 'third-party-links',
      title: '10. Third-Party Links and Services',
      content: (
        <LegalParagraph>
          Our Service may contain links to third-party websites or services that are not owned or controlled by Trakyz. We are not responsible for the privacy practices or content of these third parties.
        </LegalParagraph>
      )
    },
    {
      id: 'specific-privacy-rights',
      title: '11. Specific Privacy Rights by Region',
      content: (
        <>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-4 mb-2">California Residents</h3>
          <LegalParagraph>
            If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA).
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            <strong>Trakyz does not sell personal information under any circumstances</strong>, so the right to opt-out of sale does not apply to our Service.
          </LegalParagraph>
          
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-4 mb-2">European Economic Area (EEA) Residents</h3>
          <LegalParagraph>
            If you are in the EEA, you have rights under the General Data Protection Regulation (GDPR) as outlined in the &quot;Your Rights and Choices&quot; section.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'changes',
      title: '12. Changes to This Policy',
      content: (
        <LegalParagraph>
          We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated policy here or via email before they take effect.
        </LegalParagraph>
      )
    },
    {
      id: 'contact-us',
      title: '13. Contact Us',
      content: (
        <LegalParagraph>
          If you have any questions about this Privacy Policy or our privacy practices, please contact us at:{' '}
          <Link href="/contact" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">
            support@trakyz.com
          </Link>
        </LegalParagraph>
      )
    }
  ];

  return <LegalDocument sections={sections} lastUpdated="March 10, 2025" />;
}