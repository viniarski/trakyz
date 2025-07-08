// app/api/loans/[id]/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const loanData = await request.json()

    const { data: loan, error } = await supabase
      .from('loans')
      .update(loanData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating loan:', error)
      return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 })
    }

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    }

    return NextResponse.json(loan)
  } catch (error) {
    console.error('Error in loans PATCH:', error)
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
      .from('loans')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting loan:', error)
      return NextResponse.json({ error: 'Failed to delete loan' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in loans DELETE:', error)
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

    const { data: loan, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching loan:', error)
      return NextResponse.json({ error: 'Failed to fetch loan' }, { status: 500 })
    }

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    }

    return NextResponse.json(loan)
  } catch (error) {
    console.error('Error in loans GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}