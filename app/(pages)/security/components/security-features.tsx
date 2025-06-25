// app/(pages)/security/components/security-features.tsx

'use client'

import { Lock, Shield, Server, EyeOff } from 'lucide-react'

export default function SecurityFeatures() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8 text-center">How We Protect Your Data</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 flex flex-col items-start">
          <Lock className="h-8 w-8 text-[var(--accent-primary)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Authentication Security</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Trakyz supports secure authentication via Email, Google, GitHub, X, and LinkedIn, all securely managed by Supabase's enterprise-grade auth system. We support 2FA and recommend using YubiKey for physical security keys.
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 flex flex-col items-start">
          <Shield className="h-8 w-8 text-[var(--accent-primary)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Vercel Hosting Security</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Vercel provides TLS 1.2/1.3 encryption, DDoS protection, and SOC 2 Type II compliance for all Trakyz traffic and deployments.
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 flex flex-col items-start">
          <Server className="h-8 w-8 text-[var(--accent-primary)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Supabase Database Security</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Supabase encrypts your data at rest with AES-256 and in transit with TLS, hosted on AWS with SOC 2 compliance and role-based access controls.
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 flex flex-col items-start">
          <EyeOff className="h-8 w-8 text-[var(--accent-primary)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Privacy Features</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Features like &apos;Hide Balances&apos; let you control visibility. We minimize data collection and rely on Vercel&apos;s anonymized analytics.
          </p>
        </div>
      </div>
    </section>
  )
}