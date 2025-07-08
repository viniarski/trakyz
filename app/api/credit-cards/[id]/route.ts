// app/api/credit-cards/[id]/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const cardData = await request.json()

    const { data: card, error } = await supabase
      .from('credit_cards')
      .update(cardData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating credit card:', error)
      return NextResponse.json({ error: 'Failed to update credit card' }, { status: 500 })
    }

    if (!card) {
      return NextResponse.json({ error: 'Credit card not found' }, { status: 404 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error in credit-cards PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting credit card:', error)
      return NextResponse.json({ error: 'Failed to delete credit card' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in credit-cards DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: card, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching credit card:', error)
      return NextResponse.json({ error: 'Failed to fetch credit card' }, { status: 500 })
    }

    if (!card) {
      return NextResponse.json({ error: 'Credit card not found' }, { status: 404 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error in credit-cards GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}