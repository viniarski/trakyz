// app/(pages)/pricing/components/faq.tsx
'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function FAQ() {
  const faqs = [
    {
      question: "What features are included in the Pro plan?",
      answer: "Pro includes Advanced Analytics, Budget Management, Custom Themes, unlimited asset tracking, multiple portfolios, import/export functionality, and priority support. Free users have access to basic portfolio tracking, transaction history, and market rates."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to Pro features until the end of your billing period."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, all payments are processed securely through Stripe. We never store your credit card information on our servers."
    },
    {
      question: "What happens if I downgrade to the Free plan?",
      answer: "If you downgrade, you'll maintain access to Pro features until the end of your billing cycle. After that, you'll be limited to 5 assets and lose access to Pro-only features like Analytics, Budget, and Custom Themes."
    },
    {
      question: "How does the free trial work?",
      answer: "You get 30 days of Pro access completely free. No credit card required."
    }
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="mt-20">
      <h2 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-12">
        Frequently Asked Questions
      </h2>
      
      {/* Desktop Layout (hidden below sm) */}
      <div className="hidden sm:grid md:grid-cols-2 gap-x-12 gap-y-8">
        {faqs.map((faq, index) => (
          <div key={index}>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              {faq.question}
            </h3>
            <p className="text-[var(--text-secondary)]">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile Layout (hidden on sm and above) */}
      <div className="sm:hidden space-y-2">
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
    </div>
  )
}