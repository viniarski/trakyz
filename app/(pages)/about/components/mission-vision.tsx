// app/(pages)/about/components/mission-vision.tsx

'use client'

import { Users, Target, Globe } from 'lucide-react'

export default function MissionVision() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8 text-center">Our Mission & Vision</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 flex flex-col items-start">
          <Users className="h-8 w-8 text-[var(--accent-primary)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">User-Centric Design</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            We prioritize your needs, crafting a platform that&apos;s easy to use and packed with powerful features tailored to investors.
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 flex flex-col items-start">
          <Target className="h-8 w-8 text-[var(--accent-primary)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Precision & Insight</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Our goal is to deliver accurate data and actionable insights, helping you optimize your investment strategy.
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 flex flex-col items-start">
          <Globe className="h-8 w-8 text-[var(--accent-primary)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Global Reach</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Supporting a wide range of assets and currencies, Trakyz connects investors worldwide to their financial goals.
          </p>
        </div>
      </div>
    </section>
  )
}