// app/api/budgets/[id]/route.ts

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

    const updateData: any = {}
    
    if (body.month !== undefined) updateData.month = body.month
    if (body.planned_income !== undefined) updateData.planned_income = Number(body.planned_income)
    if (body.planned_expenses !== undefined) updateData.planned_expenses = Number(body.planned_expenses)
    if (body.actual_income !== undefined) updateData.actual_income = Number(body.actual_income)
    if (body.actual_expenses !== undefined) updateData.actual_expenses = Number(body.actual_expenses)
    if (body.categories !== undefined) updateData.categories = body.categories

    // Recalculate variances and net income
    if (body.planned_income !== undefined || body.actual_income !== undefined) {
      // Get current budget to calculate with existing values
      const { data: currentBudget } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (currentBudget) {
        const planned_income = updateData.planned_income ?? currentBudget.planned_income
        const planned_expenses = updateData.planned_expenses ?? currentBudget.planned_expenses
        const actual_income = updateData.actual_income ?? currentBudget.actual_income
        const actual_expenses = updateData.actual_expenses ?? currentBudget.actual_expenses

        updateData.income_variance = actual_income - planned_income
        updateData.expense_variance = actual_expenses - planned_expenses
        updateData.net_income = planned_income - planned_expenses
      }
    }

    updateData.updated_at = new Date().toISOString()

    const { data: budget, error } = await supabase
      .from('budgets')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating budget:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    return NextResponse.json(budget)
  } catch (error) {
    console.error('Error in budgets PATCH:', error)
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
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting budget:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Budget deleted successfully' })
  } catch (error) {
    console.error('Error in budgets DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}