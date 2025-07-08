// app/api/admin/system-settings/route.ts

import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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
    
    // Get the key from query params
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 })
    }
    
    // Fetch the setting
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ value: null })
      }
      console.error('Error fetching setting:', error)
      return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 })
    }
    
    return NextResponse.json({ value: data.value })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

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
    const { key, value } = await request.json()
    
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }
    
    // Check if setting exists
    const { data: existing } = await supabase
      .from('system_settings')
      .select('id')
      .eq('key', key)
      .single()
    
    let result
    if (existing) {
      // Update existing setting
      result = await supabase
        .from('system_settings')
        .update({
          value: typeof value === 'object' ? JSON.stringify(value) : value,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .select()
    } else {
      // Insert new setting
      result = await supabase
        .from('system_settings')
        .insert({
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
    }
    
    if (result.error) {
      console.error('Error saving setting:', result.error)
      return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}