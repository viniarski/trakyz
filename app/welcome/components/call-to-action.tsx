// app/welcome/components/call-to-action.tsx

'use client'

import { CtaButtonWithArrow } from '@/components/ui/CTA'

export default function CallToAction() {
  return (
    <div className="py-20 text-center">
      <h2 className="text-3xl font-bold text-white mb-6">
        Ready to Transform Your Investment Strategy?
      </h2>
      <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
        Join successful investors who are already optimizing their portfolios with Trakyz
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <CtaButtonWithArrow href="/sign-in">
          Start 6-Month Free Trial
        </CtaButtonWithArrow>
      </div>
    </div>
  )
}