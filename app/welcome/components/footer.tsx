// app/welcome/components/footer.tsx

'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black-[20] backdrop-blur mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            <div>
              <h3 className="text-white font-semibold mb-4 text-center md:text-left">Product</h3>
              <ul className="space-y-2 text-center md:text-left">
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/roadmap" className="text-gray-400 hover:text-white transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-center md:text-left">Support</h3>
              <ul className="space-y-2 text-center md:text-left">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-center md:text-left">Legal</h3>
              <ul className="space-y-2 text-center md:text-left">
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <div className="flex items-center justify-center md:justify-start w-full">
              <p className="text-gray-400 text-center md:text-left">© {new Date().getFullYear()} Trakyz. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}