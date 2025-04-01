// app/page.tsx

import { createClient } from '@/utils/supabase/server'
import WelcomePage from '@/components/welcome/welcome-page'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If the user is logged in, redirect to the dashboard
  if (user) {
    return redirect('/dashboard')
  }

  // Show welcome page for visitors
  return <WelcomePage />
}