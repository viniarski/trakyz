// app/api/admin/toggle-free-trial/route.ts

import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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
    
    // Get request body
    const { enabled } = await request.json()
    
    // Check if setting exists
    const { data: existing } = await supabase
      .from('system_settings')
      .select('id')
      .eq('key', 'free_trial_enabled')
      .single()
    
    if (existing) {
      // Update existing setting
      await supabase
        .from('system_settings')
        .update({
          value: JSON.stringify({ enabled }),
          updated_at: new Date().toISOString()
        })
        .eq('key', 'free_trial_enabled')
    } else {
      // Insert new setting
      await supabase
        .from('system_settings')
        .insert({
          key: 'free_trial_enabled',
          value: JSON.stringify({ enabled }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    }
    
    return NextResponse.json({ success: true, enabled })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}