// app/api/admin/trigger-market-update/route.ts

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
    
    // Call all market data endpoints to force a refresh
    const [metalsRes, cryptoRes, stocksRes, currenciesRes] = await Promise.all([
      fetch('http://localhost:3000/api/market/metals', { method: 'GET', cache: 'no-store' }),
      fetch('http://localhost:3000/api/market/crypto', { method: 'GET', cache: 'no-store' }),
      fetch('http://localhost:3000/api/market/stocks', { method: 'GET', cache: 'no-store' }),
      fetch('http://localhost:3000/api/market/currencies', { method: 'GET', cache: 'no-store' })
    ])
    
    // Check if all requests were successful
    const allSuccessful = [metalsRes, cryptoRes, stocksRes, currenciesRes].every(res => res.ok)
    
    if (!allSuccessful) {
      return NextResponse.json({ error: 'Failed to update market data' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Market data updated successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}