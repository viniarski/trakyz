// lib/types/budgetTypes.ts

export interface BudgetData {
  month: string; // YYYY-MM-DD format
  planned_income: number;
  planned_expenses: number;
  updated_at: string; // ISO timestamp
  budget_income: IncomeSelection[];
  budget_expenses: ExpenseSelection[];
}

export interface IncomeSelection {
  income_options: {
    name: string;
  }[];
  is_selected: boolean;
}

export interface ExpenseSelection {
  expense_options: {
    name: string;
  }[];
  is_selected: boolean;
}
