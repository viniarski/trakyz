// components/welcome/how-it-works.tsx

'use client'

import { Wallet, PieChart, Shield } from 'lucide-react'
import StepCard from './step-card'

export default function HowItWorks() {
  return (
    <div className="py-20 text-center">
      <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
      <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
        Simple steps to start managing your investments like a pro
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StepCard 
          icon={<Wallet />}
          title="1. Sign Up"
          description="Create your account in just a few simple steps"
        />
        <StepCard 
          icon={<PieChart />}
          title="2. Add Assets"
          description="Start by adding your investments to track their performance"
        />
        <StepCard 
          icon={<Shield />}
          title="3. Analyze & Optimize"
          description="Use our tools to analyze your portfolio and make informed decisions"
        />
      </div>
    </div>
  )
}