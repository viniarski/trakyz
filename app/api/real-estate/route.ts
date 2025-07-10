// app/api/real-estate/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch real estate properties for the user
    const { data: properties, error } = await supabase
      .from('real_estate')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching real estate properties:', error)
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
    }

    return NextResponse.json({ properties: properties || [] })
  } catch (error) {
    console.error('Error in real estate API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Create the property data
    const propertyData = {
      user_id: user.id,
      name: body.name,
      property_type: body.property_type,
      address: body.address,
      purchase_price: body.purchase_price,
      current_value: body.current_value,
      purchase_date: body.purchase_date,
      portfolio_id: body.portfolio_id,
      description: body.description,
      square_feet: body.square_feet,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      year_built: body.year_built,
      lot_size: body.lot_size,
      property_tax: body.property_tax,
      insurance_cost: body.insurance_cost,
      hoa_fees: body.hoa_fees,
      rental_income: body.rental_income,
      expenses: body.expenses,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert the property
    const { data: property, error } = await supabase
      .from('real_estate')
      .insert([propertyData])
      .select()
      .single()

    if (error) {
      console.error('Error creating real estate property:', error)
      return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
    }

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error in real estate POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}