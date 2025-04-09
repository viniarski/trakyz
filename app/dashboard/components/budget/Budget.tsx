"use client";

import { BudgetData } from "@/lib/types/budgetTypes";
import { useState } from "react";

interface BudgetProps {
  budgets: BudgetData[];
  userId: string;
}

export default function Budget({ budgets, userId }: BudgetProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Added this log here so you can map them easier later
  console.log(budgets);

  // Logging user to ensure its avaliable to the component
  console.log(userId);

  // example return for future reference
  return (
    <div className="container py-8">
      <h2 className="font-bold text-2xl mb-4">Budget Overview</h2>

      {budgets.length ? (
        budgets.map((budget) => (
          <div
            key={budget.month}
            className="border rounded p-4 shadow-sm bg-muted cursor-pointer"
            onClick={() => setSelectedMonth(budget.month)}
          >
            <h3 className="text-lg font-semibold">
              {new Date(budget.month).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <p>Planned Income: ${budget.planned_income}</p>
            <p>Planned Expenses: ${budget.planned_expenses}</p>
            <p>Last Updated: {new Date(budget.updated_at).toLocaleString()}</p>

            {/* Income Sources */}
            <p className="mt-2 text-sm font-medium">Income Sources:</p>
            <ul className="list-disc list-inside text-sm">
              {budget.budget_income
                .filter((income) => income.is_selected)
                .map((income) => (
                  <li key={income.income_options[0].name}>
                    {income.income_options[0].name}
                  </li>
                ))}
            </ul>

            {/* Expense Categories */}
            <p className="mt-2 text-sm font-medium">Expense Categories:</p>
            <ul className="list-disc list-inside text-sm">
              {budget.budget_expenses
                .filter((expense) => expense.is_selected)
                .map((expense) => (
                  <li key={expense.expense_options[0].name}>
                    {expense.expense_options[0].name}
                  </li>
                ))}
            </ul>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground">No budget data found.</p>
      )}

      {selectedMonth && (
        <p className="mt-4 text-sm text-accent">Selected: {selectedMonth}</p>
      )}
    </div>
  );
}
