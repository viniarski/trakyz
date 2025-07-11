// app/api/real-estate/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: realEstate, error } = await supabase
      .from('real_estate')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching real estate:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(realEstate || [])
  } catch (error) {
    console.error('Error in real estate GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Map the fields to match your database schema (excluding generated columns)
    const {
      property_address,
      property_type,
      purchase_price,
      current_value,
      purchase_date,
      rental_income = 0,
      mortgage_monthly_payment = 0,
      mortgage_interest_rate = 0,
      property_tax = 0,
      insurance = 0,
      maintenance_costs = 0,
      utilities = 0
    } = body

    // Don't include asset_id - let it be NULL for now since it requires a valid transaction reference
    const { data: realEstate, error } = await supabase
      .from('real_estate')
      .insert({
        user_id: user.id,
        // asset_id: null,  // Don't include this field - let it default to NULL
        property_address,
        property_type,
        purchase_price: Number(purchase_price),
        current_value: Number(current_value),
        purchase_date,
        rental_income: Number(rental_income) || 0,
        mortgage_monthly_payment: Number(mortgage_monthly_payment) || 0,
        mortgage_interest_rate: Number(mortgage_interest_rate) || 0,
        property_tax: Number(property_tax) || 0,
        insurance: Number(insurance) || 0,
        maintenance_costs: Number(maintenance_costs) || 0,
        utilities: Number(utilities) || 0,
        encrypted: false
        // monthly_cash_flow and yearly_cash_flow are generated columns - don't insert them
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating real estate property:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(realEstate, { status: 201 })
  } catch (error) {
    console.error('Error in real estate POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}