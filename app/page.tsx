// app/page.tsx

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import WelcomePage from '@/app/(welcome)/page'

export default async function Home() {
  // Check if user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If the user is logged in, redirect to the dashboard
  if (user) {
    return redirect('/protected')
  }

  // Return the welcome page for unauthenticated users
  return <WelcomePage />
}