// app/(legal)/components/legal-document/legal-document.tsx
'use client'

import Link from 'next/link'

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalDocumentProps {
  sections: LegalSection[];
  lastUpdated: string;
}

export default function LegalDocument({ sections, lastUpdated }: LegalDocumentProps) {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6 space-y-8">
      {sections.map((section) => (
        <section key={section.id}>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">{section.title}</h2>
          {section.content}
        </section>
      ))}
      
      <p className="text-[var(--text-secondary)] mt-4 text-sm italic">
        Last Updated: {lastUpdated}
      </p>
    </div>
  )
}

// Helper component for paragraphs
export function LegalParagraph({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <p className={`text-[var(--text-secondary)] text-sm ${className}`}>
      {children}
    </p>
  )
}

// Helper component for lists
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-2 mt-2 text-sm">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  )
}