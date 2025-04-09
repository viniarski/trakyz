"use client";

import { DebtData } from "@/lib/types/debtTypes";
import { useState } from "react";
import GenericForm from "@/components/GenericForm";
import {
  creditCardFields,
  loanFields,
} from "@/lib/db-client-req/GenericFormData";

// Example mapping of debt data to page
// Replace with real data later

export default function Debt({
  debtData,
  userId,
}: {
  debtData: DebtData;
  userId: string;
}) {
  const { loans, creditCards } = debtData;

  // Logged here for easier mapping later
  console.log(debtData);

  // Logging user to ensure its avaliable to the component
  console.log(userId);

  const [type, setType] = useState<"loan" | "credit-card">("loan");

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Loans</h2>
        {loans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="p-4 rounded-2xl shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <h3 className="text-lg font-medium">{loan.name}</h3>
                <p className="text-sm text-gray-500">
                  {loan.lender} • {loan.loan_type}
                </p>
                <div className="mt-2 text-sm">
                  <p>Balance: ${loan.current_balance.toLocaleString()}</p>
                  <p>Interest Rate: {loan.interest_rate}%</p>
                  <p>Monthly Payment: ${loan.monthly_payment}</p>
                  <p>Next Payment: {loan.next_payment_date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No loans found.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Credit Cards</h2>
        {creditCards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {creditCards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-2xl shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <h3 className="text-lg font-medium">
                  {card.name} • ****{card.last_four}
                </h3>
                <p className="text-sm text-gray-500">{card.issuer}</p>
                <div className="mt-2 text-sm">
                  <p>Balance: ${card.balance.toLocaleString()}</p>
                  <p>Limit: ${card.credit_limit.toLocaleString()}</p>
                  <p>Interest Rate: {card.interest_rate}%</p>
                  <p>Min Payment: ${card.min_payment}</p>
                  <p>Due: {card.due_date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No credit cards found.</p>
        )}
      </section>

      <div className="max-w-xl mx-auto space-y-6 p-4">
        <h1 className="text-2xl font-bold mb-2">Add Debt</h1>

        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${
              type === "loan" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setType("loan")}
          >
            Loan
          </button>
          <button
            className={`px-4 py-2 rounded ${
              type === "credit-card" ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setType("credit-card")}
          >
            Credit Card
          </button>
        </div>

        {type === "loan" && (
          <GenericForm
            apiRoute="/api/loans"
            userId={userId}
            fields={loanFields}
          />
        )}
        {type === "credit-card" && (
          <GenericForm
            apiRoute="/api/credit-cards"
            userId={userId}
            fields={creditCardFields}
          />
        )}
      </div>
    </div>
  );
}
