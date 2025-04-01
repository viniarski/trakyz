// app/cookie-policy/components/cookie-content.tsx

'use client'

import Link from 'next/link'

export default function CookieContent() {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6 space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">1. Introduction</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          Trakyz (&quot;Trakyz,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), uses cookies and similar technologies on the Trakyz website and platform (collectively, the &quot;Service&quot;), hosted on Vercel, to enhance functionality, improve user experience, and analyze usage. This Cookie Policy explains what cookies are, how we use them, and your choices regarding their use. This policy is part of our broader{' '}
          <Link href="/privacy" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">
            Privacy Policy
          </Link>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">2. What Are Cookies</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          Cookies are small text files stored on your device when you visit the Service. They contain information about your browsing activities and preferences. We also use similar technologies, such as local storage, processed via Vercel, which serve comparable purposes (collectively referred to as &quot;Cookies&quot; herein).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">3. Types of Cookies We Use</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          We use the following categories of Cookies:
        </p>
        <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
          <li>
            <strong>Essential Cookies</strong>: Necessary for the Service to function properly, such as maintaining your login session via Google, X, LinkedIn, GitHub, Apple, Microsoft, or email authentication. These cannot be disabled.
          </li>
          <li>
            <strong>Performance Cookies</strong>: Collect anonymized data on how users interact with the Service, processed via Vercel analytics, to optimize performance.
          </li>
          <li>
            <strong>Functionality Cookies</strong>: Remember your preferences (e.g., currency selection) to provide a personalized experience.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">4. Purposes of Cookies</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          We use Cookies for the following purposes:
        </p>
        <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
          <li>Authentication and security (e.g., verifying your identity via our authentication providers including Google, X, LinkedIn, GitHub, Apple, and Microsoft).</li>
          <li>Personalization (e.g., saving your settings).</li>
          <li>Analytics and research (e.g., understanding user behavior via Vercel).</li>
          <li>Service improvement (e.g., identifying technical issues).</li>
          <li>Facilitating communication between your device and our servers.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">5. Third-Party Cookies</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          We may allow third-party services to place Cookies:
        </p>
        <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
          <li>Vercel: For hosting and analytics (see{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">
              Vercel Privacy Policy
            </a>).
          </li>
          <li>Supabase: For database storage (see{' '}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">
              Supabase Privacy Policy
            </a>).
          </li>
          <li>Authentication Providers: Google, X, LinkedIn, GitHub, Apple, and Microsoft for authentication, subject to their respective privacy policies.</li>
        </ul>
        <p className="text-[var(--text-secondary)] mt-2 text-sm">
          All data processed through cookies is encrypted to protect your privacy and security.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">6. Cookie Duration</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          Cookies may be:
        </p>
        <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
          <li><strong>Session Cookies</strong>: Temporary and deleted when you close your browser.</li>
          <li><strong>Persistent Cookies</strong>: Remain on your device until they expire or you delete them, typically up to one year.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">7. Managing Your Cookie Preferences</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          Most web browsers allow you to manage your cookie preferences. You can:
        </p>
        <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
          <li>Delete cookies from your device.</li>
          <li>Block cookies by activating the setting on your browser that allows you to refuse all or some cookies.</li>
          <li>Set your browser to notify you when you receive a cookie.</li>
        </ul>
        <p className="text-[var(--text-secondary)] mt-2 text-sm">
          Please note that if you choose to block or delete cookies, you may not be able to access certain areas or features of our Service, and some functions may not operate properly.
        </p>
        <p className="text-[var(--text-secondary)] mt-2 text-sm">
          Instructions for managing cookies in common browsers:
        </p>
        <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">Microsoft Edge</a></li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">8. Do Not Track Signals</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          Some browsers incorporate a &quot;Do Not Track&quot; (DNT) feature that, when turned on, signals to websites and online services that you do not want to be tracked. Because there is not yet a common understanding of how to interpret DNT signals, we do not currently respond to DNT signals on our Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">9. Changes to This Cookie Policy</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. If we make material changes, we will notify you as required by applicable law, which may include posting a notice on our website or providing you with notification through the Service. Any changes will become effective when posted unless indicated otherwise.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">10. Contact Us</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          If you have any questions about our use of cookies or this Cookie Policy, please contact us at:{' '}
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