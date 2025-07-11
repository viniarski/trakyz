// app/api/income-options/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: incomeOptions, error } = await supabase
      .from('income_options')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching income options:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(incomeOptions || [])
  } catch (error) {
    console.error('Error in income options GET:', error)
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
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data: incomeOption, error } = await supabase
      .from('income_options')
      .insert({
        name: name.trim()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating income option:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(incomeOption, { status: 201 })
  } catch (error) {
    console.error('Error in income options POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}