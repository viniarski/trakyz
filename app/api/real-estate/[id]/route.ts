// app/api/real-estate/[id]/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = params

    // Map the fields to match your database schema (excluding generated columns)
    const updateData: any = {}
    
    if (body.property_address !== undefined) updateData.property_address = body.property_address
    if (body.property_type !== undefined) updateData.property_type = body.property_type
    if (body.purchase_price !== undefined) updateData.purchase_price = Number(body.purchase_price)
    if (body.current_value !== undefined) updateData.current_value = Number(body.current_value)
    if (body.purchase_date !== undefined) updateData.purchase_date = body.purchase_date
    if (body.rental_income !== undefined) updateData.rental_income = Number(body.rental_income) || 0
    if (body.mortgage_monthly_payment !== undefined) updateData.mortgage_monthly_payment = Number(body.mortgage_monthly_payment) || 0
    if (body.mortgage_interest_rate !== undefined) updateData.mortgage_interest_rate = Number(body.mortgage_interest_rate) || 0
    if (body.property_tax !== undefined) updateData.property_tax = Number(body.property_tax) || 0
    if (body.insurance !== undefined) updateData.insurance = Number(body.insurance) || 0
    if (body.maintenance_costs !== undefined) updateData.maintenance_costs = Number(body.maintenance_costs) || 0
    if (body.utilities !== undefined) updateData.utilities = Number(body.utilities) || 0

    // DO NOT update monthly_cash_flow and yearly_cash_flow - they are generated columns

    updateData.updated_at = new Date().toISOString()

    const { data: realEstate, error } = await supabase
      .from('real_estate')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating real estate property:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!realEstate) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json(realEstate)
  } catch (error) {
    console.error('Error in real estate PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const { error } = await supabase
      .from('real_estate')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting real estate property:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Error in real estate DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}