// types/budget.ts

export interface IncomeOption {
  id: number
  name: string
}

export interface ExpenseOption {
  id: number
  name: string
}

export interface BudgetIncomeEntry {
  budget_month: string // date
  user_id: string // uuid
  income_option_id: number
  is_selected: boolean
  income_options?: IncomeOption // For joined queries
}

export interface BudgetExpenseEntry {
  budget_month: string // date
  user_id: string // uuid
  expense_option_id: number
  is_selected: boolean
  expense_options?: ExpenseOption // For joined queries
}

export interface BudgetData {
  month: string // date - format: YYYY-MM-DD
  user_id: string // uuid
  planned_income: number // numeric
  planned_expenses: number // numeric
  updated_at: string // timestamptz
  income_entries?: BudgetIncomeEntry[] // From joined query
  expense_entries?: BudgetExpenseEntry[] // From joined query
}

export interface BudgetFormData {
  month: string
  planned_income: number
  planned_expenses: number
  income_entries?: {
    income_option_id: number
    is_selected: boolean
  }[]
  expense_entries?: {
    expense_option_id: number
    is_selected: boolean
  }[]
}

export interface BudgetSummary {
  total_budgets: number
  current_month_budget: BudgetData | null
  total_planned_income: number
  total_planned_expenses: number
  selected_income_count: number
  selected_expense_count: number
}

// Default income options to seed the database
export const DEFAULT_INCOME_OPTIONS = [
  'Salary',
  'Freelance Income',
  'Investment Income',
  'Business Income',
  'Rental Income',
  'Side Hustle',
  'Bonus',
  'Commission',
  'Other Income'
]

// Default expense options to seed the database
export const DEFAULT_EXPENSE_OPTIONS = [
  'Housing/Rent',
  'Utilities',
  'Groceries',
  'Transportation',
  'Insurance',
  'Healthcare',
  'Entertainment',
  'Dining Out',
  'Shopping',
  'Subscriptions',
  'Phone/Internet',
  'Debt Payments',
  'Savings',
  'Personal Care',
  'Education',
  'Travel',
  'Gifts',
  'Other Expenses'
]