// app/api/portfolios/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching portfolios:', error)
      return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 })
    }

    return NextResponse.json(portfolios || [])
  } catch (error) {
    console.error('Error in portfolios API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()
    
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Portfolio name is required' }, { status: 400 })
    }

    // Check if this is the user's first portfolio
    const { data: existingPortfolios } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)

    const isFirstPortfolio = !existingPortfolios || existingPortfolios.length === 0

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        name: name.trim(),
        is_default: isFirstPortfolio, // First portfolio is default
        total_value: 0,
        total_cost: 0,
        total_profit_loss: 0,
        total_profit_loss_percentage: 0,
        asset_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating portfolio:', error)
      return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
    }

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Error in portfolio creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}