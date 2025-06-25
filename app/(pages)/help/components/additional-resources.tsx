// app/(pages)/help/components/additional-resources.tsx

'use client'

import Link from 'next/link'

export default function AdditionalResources() {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 text-center">Additional Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">User Guides</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Detailed documentation on using Trakyz features like portfolio tracking and analytics.
          </p>
          <Link
            href="/help#guides"
            className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] text-sm mt-2 inline-block"
          >
            Learn More
          </Link>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Video Tutorials</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Watch step-by-step videos to master Trakyz tools and maximize your experience.
          </p>
          <Link
            href="/help#tutorials"
            className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] text-sm mt-2 inline-block"
          >
            Watch Now
          </Link>
        </div>
      </div>
    </section>
  )
}