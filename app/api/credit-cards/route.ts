// app/api/credit-cards/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const cardData = await request.json()

    // Get the user's default portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', cardData.user_id)
      .eq('is_default', true)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Default portfolio not found' }, { status: 404 })
    }

    // Add the portfolio_id to the card data
    const cardWithPortfolio = {
      ...cardData,
      portfolio_id: portfolio.id
    }

    const { data: card, error } = await supabase
      .from('credit_cards')
      .insert([cardWithPortfolio])
      .select()
      .single()

    if (error) {
      console.error('Error creating credit card:', error)
      return NextResponse.json({ error: 'Failed to create credit card' }, { status: 500 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error in credit-cards POST:', error)
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

    const { data: creditCards, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching credit cards:', error)
      return NextResponse.json({ error: 'Failed to fetch credit cards' }, { status: 500 })
    }

    return NextResponse.json(creditCards)
  } catch (error) {
    console.error('Error in credit-cards GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}