// app/(pages)/pricing/components/feature-comparison.tsx
'use client'

export function FeatureComparison() {
  return (
    <div className="mt-20">
      <h2 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-12">
        Compare Plans
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-6 py-4 text-left text-[var(--text-primary)]">Feature</th>
              <th className="px-6 py-4 text-center text-[var(--text-primary)]">Free</th>
              <th className="px-6 py-4 text-center text-[var(--text-primary)]">Pro</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-700">
              <td className="px-6 py-4 text-[var(--text-secondary)]">Portfolio Tracking</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">Up to 5 assets</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">Unlimited</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="px-6 py-4 text-[var(--text-secondary)]">Transaction History</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">Basic</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">Advanced</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="px-6 py-4 text-[var(--text-secondary)]">Market Rates</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">✓</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">✓</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="px-6 py-4 text-[var(--text-secondary)] flex items-center">
                Advanced Analytics
              </td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">-</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">✓</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="px-6 py-4 text-[var(--text-secondary)] flex items-center">
                Budget Management
              </td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">-</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">✓</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="px-6 py-4 text-[var(--text-secondary)] flex items-center">
                Custom Themes
              </td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">-</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">✓</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="px-6 py-4 text-[var(--text-secondary)]">Import/Export</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">-</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">CSV, XLSX, JSON, PDF</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="px-6 py-4 text-[var(--text-secondary)]">Multiple Portfolios</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">-</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">✓</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-[var(--text-secondary)]">Priority Support</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">-</td>
              <td className="px-6 py-4 text-center text-[var(--text-secondary)]">✓</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}