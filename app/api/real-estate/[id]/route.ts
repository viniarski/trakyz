// app/api/real-estate/[id]/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the specific property
    const { data: property, error } = await supabase
      .from('real_estate')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching real estate property:', error)
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error in real estate GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: RouteParams
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Update the property data
    const propertyData = {
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
      updated_at: new Date().toISOString()
    }

    // Update the property
    const { data: property, error } = await supabase
      .from('real_estate')
      .update(propertyData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating real estate property:', error)
      return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error in real estate PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: RouteParams
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete the property
    const { error } = await supabase
      .from('real_estate')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting real estate property:', error)
      return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Error in real estate DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}