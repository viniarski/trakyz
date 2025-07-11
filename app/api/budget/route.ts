// app/api/budgets/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch budgets with all related data
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('month', { ascending: false })

    if (budgetsError) {
      console.error('Error fetching budgets:', budgetsError)
      return NextResponse.json({ error: budgetsError.message }, { status: 500 })
    }

    // For each budget, fetch income and expense entries
    const budgetsWithDetails = await Promise.all(
      (budgets || []).map(async (budget) => {
        // Fetch income entries for this budget month
        const { data: incomeEntries } = await supabase
          .from('budget_income')
          .select(`
            *,
            income_options (
              id,
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('budget_month', budget.month)

        // Fetch expense entries for this budget month
        const { data: expenseEntries } = await supabase
          .from('budget_expenses')
          .select(`
            *,
            expense_options (
              id,
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('budget_month', budget.month)

        return {
          ...budget,
          income_entries: incomeEntries || [],
          expense_entries: expenseEntries || []
        }
      })
    )

    return NextResponse.json(budgetsWithDetails)
  } catch (error) {
    console.error('Error in budgets GET:', error)
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
    
    const {
      month,
      planned_income,
      planned_expenses,
      income_entries = [],
      expense_entries = []
    } = body

    // Create budget entry
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        month,
        planned_income: Number(planned_income),
        planned_expenses: Number(planned_expenses)
      })
      .select()
      .single()

    if (budgetError) {
      console.error('Error creating budget:', budgetError)
      return NextResponse.json({ error: budgetError.message }, { status: 500 })
    }

    // Create income entries if provided
    if (income_entries.length > 0) {
      const incomeData = income_entries.map((entry: any) => ({
        user_id: user.id,
        budget_month: month,
        income_option_id: entry.income_option_id,
        is_selected: entry.is_selected || false
      }))

      const { error: incomeError } = await supabase
        .from('budget_income')
        .insert(incomeData)

      if (incomeError) {
        console.error('Error creating income entries:', incomeError)
      }
    }

    // Create expense entries if provided
    if (expense_entries.length > 0) {
      const expenseData = expense_entries.map((entry: any) => ({
        user_id: user.id,
        budget_month: month,
        expense_option_id: entry.expense_option_id,
        is_selected: entry.is_selected || false
      }))

      const { error: expenseError } = await supabase
        .from('budget_expenses')
        .insert(expenseData)

      if (expenseError) {
        console.error('Error creating expense entries:', expenseError)
      }
    }

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Error in budgets POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}