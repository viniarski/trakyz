// app/api/loans/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const loanData = await request.json()

    // Get the user's default portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', loanData.user_id)
      .eq('is_default', true)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Default portfolio not found' }, { status: 404 })
    }

    // Add the portfolio_id to the loan data
    const loanWithPortfolio = {
      ...loanData,
      portfolio_id: portfolio.id
    }

    const { data: loan, error } = await supabase
      .from('loans')
      .insert([loanWithPortfolio])
      .select()
      .single()

    if (error) {
      console.error('Error creating loan:', error)
      return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 })
    }

    return NextResponse.json(loan)
  } catch (error) {
    console.error('Error in loans POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: loans, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching loans:', error)
      return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 })
    }

    return NextResponse.json(loans)
  } catch (error) {
    console.error('Error in loans GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}