// app/(auth)/layout.tsx

import Link from 'next/link'
import Image from 'next/image'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">      
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 w-full max-w-md animate-scale-up">
        <div className="flex justify-center mb-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-2xl font-medium text-white uppercase tracking-tight font-mono"
          >
            <div className="relative h-6 w-6">
              <Image 
                src="/logo_trakyz.png"
                alt="Trakyz Logo" 
                width={24}
                height={24}
                className="object-contain object-left"
                priority
              />
            </div>
            TRAKYZ
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}