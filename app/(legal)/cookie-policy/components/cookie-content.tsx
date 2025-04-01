// app/(legal)/cookie-policy/components/cookie-content.tsx

'use client'

import Link from 'next/link'
import LegalDocument, { LegalParagraph, LegalList, type LegalSection } from '@/app/(legal)/components/legal-document'
export default function CookieContent() {
  const sections: LegalSection[] = [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: (
        <LegalParagraph>
          Trakyz (&quot;Trakyz,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), uses cookies and similar technologies on the Trakyz website and platform (collectively, the &quot;Service&quot;), hosted on Vercel, to enhance functionality, improve user experience, and analyze usage. This Cookie Policy explains what cookies are, how we use them, and your choices regarding their use. This policy is part of our broader{' '}
          <Link href="/privacy" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">
            Privacy Policy
          </Link>.
        </LegalParagraph>
      )
    },
    {
      id: 'what-are-cookies',
      title: '2. What Are Cookies',
      content: (
        <LegalParagraph>
          Cookies are small text files stored on your device when you visit the Service. They contain information about your browsing activities and preferences. We also use similar technologies, such as local storage, processed via Vercel, which serve comparable purposes (collectively referred to as &quot;Cookies&quot; herein).
        </LegalParagraph>
      )
    },
    {
      id: 'types-of-cookies',
      title: '3. Types of Cookies We Use',
      content: (
        <>
          <LegalParagraph>
            We use the following categories of Cookies:
          </LegalParagraph>
          <LegalList items={[
            <>
              <strong>Essential Cookies</strong>: Necessary for the Service to function properly, such as maintaining your login session via Google, X, LinkedIn, GitHub, Apple, Microsoft, or email authentication. These cannot be disabled.
            </>,
            <>
              <strong>Performance Cookies</strong>: Collect anonymized data on how users interact with the Service, processed via Vercel analytics, to optimize performance.
            </>,
            <>
              <strong>Functionality Cookies</strong>: Remember your preferences (e.g., currency selection) to provide a personalized experience.
            </>
          ]}/>
        </>
      )
    },
    {
      id: 'purposes-of-cookies',
      title: '4. Purposes of Cookies',
      content: (
        <>
          <LegalParagraph>
            We use Cookies for the following purposes:
          </LegalParagraph>
          <LegalList items={[
            'Authentication and security (e.g., verifying your identity via our authentication providers including Google, X, LinkedIn, GitHub, Apple, and Microsoft).',
            'Personalization (e.g., saving your settings).',
            'Analytics and research (e.g., understanding user behavior via Vercel).',
            'Service improvement (e.g., identifying technical issues).',
            'Facilitating communication between your device and our servers.'
          ]}/>
        </>
      )
    },
    {
      id: 'third-party-cookies',
      title: '5. Third-Party Cookies',
      content: (
        <>
          <LegalParagraph>
            We may allow third-party services to place Cookies:
          </LegalParagraph>
          <LegalList items={[
            <>
              Vercel: For hosting and analytics (see{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">
                Vercel Privacy Policy
              </a>).
            </>,
            <>
              Supabase: For database storage (see{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">
                Supabase Privacy Policy
              </a>).
            </>,
            'Authentication Providers: Google, X, LinkedIn, GitHub, Apple, and Microsoft for authentication, subject to their respective privacy policies.'
          ]}/>
          <LegalParagraph className="mt-2">
            All data processed through cookies is encrypted to protect your privacy and security.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'cookie-duration',
      title: '6. Cookie Duration',
      content: (
        <>
          <LegalParagraph>
            Cookies may be:
          </LegalParagraph>
          <LegalList items={[
            <><strong>Session Cookies</strong>: Temporary and deleted when you close your browser.</>,
            <><strong>Persistent Cookies</strong>: Remain on your device until they expire or you delete them, typically up to one year.</>
          ]}/>
        </>
      )
    },
    {
      id: 'managing-preferences',
      title: '7. Managing Your Cookie Preferences',
      content: (
        <>
          <LegalParagraph>
            Most web browsers allow you to manage your cookie preferences. You can:
          </LegalParagraph>
          <LegalList items={[
            'Delete cookies from your device.',
            'Block cookies by activating the setting on your browser that allows you to refuse all or some cookies.',
            'Set your browser to notify you when you receive a cookie.'
          ]}/>
          <LegalParagraph className="mt-2">
            Please note that if you choose to block or delete cookies, you may not be able to access certain areas or features of our Service, and some functions may not operate properly.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            Instructions for managing cookies in common browsers:
          </LegalParagraph>
          <LegalList items={[
            <><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">Google Chrome</a></>,
            <><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">Mozilla Firefox</a></>,
            <><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">Safari</a></>,
            <><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">Microsoft Edge</a></>
          ]}/>
        </>
      )
    },
    {
      id: 'do-not-track',
      title: '8. Do Not Track Signals',
      content: (
        <LegalParagraph>
          Some browsers incorporate a &quot;Do Not Track&quot; (DNT) feature that, when turned on, signals to websites and online services that you do not want to be tracked. Because there is not yet a common understanding of how to interpret DNT signals, we do not currently respond to DNT signals on our Service.
        </LegalParagraph>
      )
    },
    {
      id: 'changes',
      title: '9. Changes to This Cookie Policy',
      content: (
        <LegalParagraph>
          We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. If we make material changes, we will notify you as required by applicable law, which may include posting a notice on our website or providing you with notification through the Service. Any changes will become effective when posted unless indicated otherwise.
        </LegalParagraph>
      )
    },
    {
      id: 'contact-us',
      title: '10. Contact Us',
      content: (
        <LegalParagraph>
          If you have any questions about our use of cookies or this Cookie Policy, please contact us at:{' '}
          <Link href="/contact" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">
            support@trakyz.com
          </Link>
        </LegalParagraph>
      )
    }
  ];

  return <LegalDocument sections={sections} lastUpdated="March 10, 2025" />;
}