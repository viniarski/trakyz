// app/(pages)/pricing/components/faq-section.tsx

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQSection() {
  const faqs = [
    {
      question: "How do I get started with Trakyz?",
      answer: (
        <>
          To get started, sign in with your Google or X account on the homepage and log in. Once logged in, you can add assets to your portfolio via the &apos;Add Asset&apos; button on the Dashboard. Explore our{' '}
          <a href="/guides" className="text-[var(--accent-primary)] hover:underline">
            User Guides
          </a>{' '}
          for detailed documentation on using Trakyz features like portfolio tracking and analytics or{' '}
          <a href="/tutorials" className="text-[var(--accent-primary)] hover:underline">
            Video Tutorials
          </a>{' '}
          to watch step-by-step videos to master Trakyz tools and maximize your experience.
        </>
      ),
    },
    {
      question: "Can I cancel my subscription?",
      answer: (
        <>
          Yes, you can cancel your subscription at any time on the{' '}
          <a href="/settings" className="text-[var(--accent-primary)] hover:underline">
            Settings
          </a>{' '}
          page. Navigate to the &apos;Billing & Subscription&apos; section and use the &apos;Manage Subscription&apos; option to cancel. Your access to Pro features will continue until the end of your current billing period. No further charges will be applied after cancellation.
        </>
      ),
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept payments with Apple Pay, Google Pay, PayPal, and major credit cards (Visa, Mastercard, American Express, Discover, Diners Club, JCB, and China UnionPay) from customers worldwide. All payments are processed securely via our third-party payment provider, Stripe."
    },
    {
      question: "Can I upgrade from Free to Pro?",
      answer: (
        <>
          Absolutely! You can upgrade to Pro at any time from the{' '}
          <a href="/settings" className="text-[var(--accent-primary)] hover:underline">
            Settings
          </a>{' '}
          page or the{' '}
          <a href="/pricing" className="text-[var(--accent-primary)] hover:underline">
            Pricing
          </a>{' '}
          page. Your existing portfolio data will seamlessly transition to the Pro plan, and you&apos;ll gain immediate access to premium features.
        </>
      ),
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we prioritize your security. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We conduct regular security audits, use multi-factor authentication, and comply with industry standards to protect your information."
    },
    {
      question: "How often is market data updated?",
      answer: "Currently, all accounts receive market data updates once a day. We are working on adding live data updates for all accounts in the future. Data frequency may vary by asset class due to provider limitations."
    },
    {
      question: "How can I export my portfolio data?",
      answer: (
        <>
          Pro users can import and export their portfolio data in CSV, XLSX, JSON, and PDF report formats on the Transactions
          page. Navigate to the Transactions page, select &apos;Export&apos; or &apos;Import&apos; and choose your preferred file format and date range.
        </>
      ),
    },
    {
      question: "What assets can I track?",
      answer: "Trakyz supports a wide range of assets, including stocks, ETFs, cryptocurrencies, precious metals, real estate, bonds, REITs, commodities, and forex. See our Asset Classes section on the homepage for the full list."
    },
    {
      question: "How do I contact support?",
      answer: (
        <>
          You can reach our support team via email at{' '}
          <a href="mailto:support@trakyz.com" className="text-[var(--accent-primary)] hover:underline">
            support@trakyz.com
          </a>{' '}
          or visit the{' '}
          <a href="/contact" className="text-[var(--accent-primary)] hover:underline">
            Contact
          </a>{' '}
          page. Pro users can benefit from priority email support.
        </>
      ),
    },
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 text-center">FAQ</h2>
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-[var(--bg-hover)]">
            <button
              onClick={() => handleClick(index)}
              className="w-full py-4 text-left flex items-center justify-between text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
            >
              <span className="text-lg font-medium">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-[var(--text-secondary)] transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-4' : 'max-h-0'}`}
            >
              <p className="text-[var(--text-secondary)] text-sm">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}