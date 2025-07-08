// app/(pages)/pricing/components/quick-links.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DollarSign, CreditCard, BarChart2, Mail, Shield, FileText, Lock, Cookie, Info, ChevronDown } from 'lucide-react'

export default function QuickLinks() {
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { icon: DollarSign, text: "Pricing", href: "/pricing" },
    { icon: CreditCard, text: "Billing & Subscriptions", href: "/settings" },
    { icon: BarChart2, text: "Roadmap", href: "/roadmap" },
    { icon: Mail, text: "Contact", href: "/contact" },
    { icon: Info, text: "About Us", href: "/about" },
    { icon: Shield, text: "Security Information", href: "/security" },
    { icon: FileText, text: "Terms of Service", href: "/terms" },
    { icon: Lock, text: "Privacy Policy", href: "/privacy" },
    { icon: Cookie, text: "Cookie Policy", href: "/cookie-policy" }
  ]

  return (
    <div className="mt-8">
      {/* Mobile Dropdown (hidden on sm and above) */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-2 px-4 text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors flex items-center justify-between border-b border-[var(--bg-hover)]"
        >
          <span>Quick Links</span>
          <ChevronDown className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="mt-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 px-4 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors border-b border-[var(--bg-hover)]"
                  onClick={() => setIsOpen(false)} // Close dropdown on click
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {link.text}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Desktop Layout (hidden below sm) */}
      <div className="hidden sm:flex flex-wrap gap-4 justify-center">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors border-b border-transparent hover:border-[var(--accent-primary)]"
            >
              <Icon className="h-4 w-4" />
              {link.text}
            </Link>
          )
        })}
      </div>
    </div>
  )
}