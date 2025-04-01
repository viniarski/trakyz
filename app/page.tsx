// app/page.tsx

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'

// Simple loading component
function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  )
}

// Corrected import path based on your component location
const WelcomePage = dynamic(
  () => import('@/app/(welcome)/page'),
  { 
    ssr: true,
    loading: () => <LoadingState />
  }
)

export default async function Home() {
  // Check if user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If the user is logged in, redirect to the dashboard
  if (user) {
    return redirect('/protected')
  }

  // Return the welcome page
  return <WelcomePage />
}