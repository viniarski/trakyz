// app/api/admin/users/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check if user is authenticated and has admin role
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Get user's role from profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError || userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Fetch all user profiles
    const { data: profiles, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
    
    if (fetchError) {
      console.error('Error fetching profiles:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }
    
    // For each profile, get the auth user info separately
    const usersWithInfo = await Promise.all(profiles.map(async (profile) => {
      // Get user auth info
      const { data: authData } = await supabase.auth.admin.getUserById(profile.id)
      
      return {
        id: profile.id,
        email: authData?.user?.email || 'unknown',
        role: profile.role || 'user',
        plan_type: 'pro', // You'll need to customize this based on your data model
        last_sign_in_at: authData?.user?.last_sign_in_at,
        created_at: authData?.user?.created_at || profile.created_at,
        profile: {
          theme_preference: profile.theme_preference || 'blue'
        }
      }
    }))
    
    return NextResponse.json({ users: usersWithInfo })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}