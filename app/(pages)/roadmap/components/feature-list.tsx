// app/(pages)/roadmap/components/feature-list.tsx

'use client'

import { BarChart2, Smartphone, Zap, FileText, Share2, Building, Wallet, Link, BookOpen } from 'lucide-react'

export default function FeatureList() {
  const roadmapFeatures = [
    {
      title: 'Enhanced Analytics',
      description: 'New chart customization options, detailed headers, and risk/volatility metrics like Sharpe Ratio and standard deviation.',
      icon: BarChart2,
      status: 'In Progress'
    },
    {
      title: 'Smart Insights & AI Predictions',
      description: 'Automated portfolio rebalancing, risk assessment, and personalized investment suggestions powered by advanced AI.',
      icon: Zap,
      status: 'In Progress'
    },
    {
      title: 'Financial Education Hub',
      description: 'Access a comprehensive library of investment guides, tutorials, market insights, and educational resources tailored to your portfolio and investment goals.',
      icon: BookOpen,
      status: 'In Progress'
    },
    {
      title: 'Tax Optimization & Reporting',
      description: 'Capital gains calculations, tax-loss harvesting, and support for international tax reporting requirements.',
      icon: FileText,
      status: 'Planned'
    },
    {
      title: 'Portfolio Sharing',
      description: 'Securely share your portfolio with advisors, family, or friends, with customizable permissions and export options.',
      icon: Share2,
      status: 'Planned'
    },
    {
      title: 'iOS / Android App',
      description: 'Manage your investments on the go with native mobile apps for iOS and Android, featuring full functionality and real-time updates.',
      icon: Smartphone,
      status: 'Planned'
    },
    {
      title: 'Bank Integration',
      description: 'Connect directly to your bank accounts to automatically track transactions and update your financial data in real-time.',
      icon: Building,
      status: 'Planned'
    },
    {
      title: 'Crypto Wallet Integration',
      description: 'Link your cryptocurrency wallets for automatic portfolio updates and seamless tracking of your digital assets.',
      icon: Wallet,
      status: 'Planned'
    },
    {
      title: 'API Integrations',
      description: 'Connect Trakyz with third-party financial services and tools through our comprehensive API ecosystem.',
      icon: Link,
      status: 'Planned'
    }
  ]

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] text-center mb-8">Future Upgrades</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roadmapFeatures.map((feature, index) => (
          <div
            key={index}
            className="bg-[var(--bg-secondary)] rounded-xl p-6 flex flex-col items-start hover:bg-[var(--bg-secondary)]/70 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <feature.icon className="h-8 w-8 text-[var(--accent-primary)]" />
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">{feature.title}</h3>
            </div>
            <p className="text-[var(--text-secondary)] text-sm flex-grow">
              {feature.description}
            </p>
            <div className="mt-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  feature.status === 'In Progress'
                    ? 'bg-[var(--accent-primary-20)] text-[var(--accent-primary)]'
                    : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                }`}
              >
                {feature.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}