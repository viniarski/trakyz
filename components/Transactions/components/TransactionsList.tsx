// components/Transactions/components/TransactionsList.tsx

import React from 'react';
import { ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Transaction, CurrencyCode } from '@/types';

type SortKey =
  | "date"
  | "transaction_type"
  | "category"
  | "asset_type"
  | "quantity"
  | "price"
  | "total";
type SortOrder = "asc" | "desc";

interface TransactionsListProps {
  transactions: Transaction[];
  sortKey: SortKey;
  sortOrder: SortOrder;
  handleSort: (key: SortKey) => void;
  currency: CurrencyCode;
}

// Helper function to format date consistently (no locale dependency)
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${year}`;
};

export function TransactionsList({ 
  transactions, 
  sortKey, 
  sortOrder, 
  handleSort,
  currency
}: TransactionsListProps) {
  // Sort arrow component
  const SortArrow = ({ columnKey }: { columnKey: SortKey }) => (
    <span className="ml-1 inline-block">
      <ChevronUp
        className={`h-4 w-4 transition-transform ${
          sortKey === columnKey
            ? sortOrder === "asc"
              ? "text-[var(--text-primary)]"
              : "text-[var(--text-primary)] rotate-180"
            : "text-[var(--text-secondary)]/50"
        }`}
      />
    </span>
  );

  // Group transactions by date for mobile view
  const groupedTransactions = (() => {
    const groups: Record<string, Transaction[]> = {};

    transactions.forEach((transaction) => {
      const dateStr = formatDate(transaction.date);  // Fixed: use formatDate instead of toLocaleDateString
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(transaction);
    });

    return Object.entries(groups).sort(([dateA], [dateB]) => {
      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });
  })();

  // Desktop view - Table
  const DesktopView = () => (
    <div className="hidden md:block p-4 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="">
            <th
              className="px-2 py-0 text-left text-[var(--text-secondary)] text-xs font-medium cursor-pointer hover:text-[var(--text-primary)]"
              onClick={() => handleSort("date")}
            >
              Date <SortArrow columnKey="date" />
            </th>
            <th
              className="px-2 py-0 text-left text-[var(--text-secondary)] text-xs font-medium cursor-pointer hover:text-[var(--text-primary)]"
              onClick={() => handleSort("transaction_type")}
            >
              Type <SortArrow columnKey="transaction_type" />
            </th>
            <th
              className="px-2 py-0 text-left text-[var(--text-secondary)] text-xs font-medium cursor-pointer hover:text-[var(--text-primary)]"
              onClick={() => handleSort("category")}
            >
              Category <SortArrow columnKey="category" />
            </th>
            <th
              className="px-2 py-0 text-left text-[var(--text-secondary)] text-xs font-medium cursor-pointer hover:text-[var(--text-primary)]"
              onClick={() => handleSort("asset_type")}
            >
              Asset <SortArrow columnKey="asset_type" />
            </th>
            <th
              className="px-2 py-0 text-right text-[var(--text-secondary)] text-xs font-medium cursor-pointer hover:text-[var(--text-primary)]"
              onClick={() => handleSort("quantity")}
            >
              Quantity <SortArrow columnKey="quantity" />
            </th>
            <th
              className="px-2 py-0 text-right text-[var(--text-secondary)] text-xs font-medium cursor-pointer hover:text-[var(--text-primary)]"
              onClick={() => handleSort("price")}
            >
              Price <SortArrow columnKey="price" />
            </th>
            <th
              className="px-2 py-0 text-right text-[var(--text-secondary)] text-xs font-medium cursor-pointer hover:text-[var(--text-primary)]"
              onClick={() => handleSort("total")}
            >
              Total <SortArrow columnKey="total" />
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-b border-gray-700 hover:bg-[var(--bg-hover)]/50"
            >
              <td className="px-2 py-0 text-[var(--text-primary)] text-xs">
                {formatDate(transaction.date)}
              </td>
              <td
                className={`px-2 py-0 text-xs ${transaction.transaction_type === "BUY" ?
                  "text-green-500" : "text-red-500"}`}
              >
                {transaction.transaction_type}
              </td>
              <td className="px-2 py-0 text-xs">
                <div className="flex items-center gap-2">
                  <CategoryIcon type={transaction.category} />
                  <span className="text-[var(--text-primary)]">
                    {transaction.category}
                  </span>
                </div>
              </td>
              <td className="px-2 py-0 text-[var(--text-primary)] text-xs">
                {transaction.asset_type}
              </td>
              <td className="px-2 py-0 text-right text-[var(--text-primary)] text-xs">
                {transaction.quantity.toLocaleString()}
              </td>
              <td className="px-2 py-0 text-right text-[var(--text-primary)] text-xs">
                {formatCurrency(transaction.price, currency)}
              </td>
              <td className="px-2 py-0 text-right text-[var(--text-primary)] text-xs">
                {formatCurrency(
                  transaction.quantity * transaction.price,
                  currency
                )}
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="p-8 text-center text-[var(--text-secondary)]"
              >
                No transactions yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Mobile view - Date grouped transactions
  const MobileView = () => (
    <div className="md:hidden p-4">
      {groupedTransactions.map(([dateStr, dateTransactions]) => (
        <div key={dateStr} className="mb-4">
          <div className="bg-[var(--bg-hover)]/50 px-3 py-2 rounded-t-lg">
            <h3 className="text-[var(--text-primary)] font-medium">
              {dateStr}
            </h3>
          </div>

          <div className="divide-y divide-gray-700">
            {dateTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]/30"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CategoryIcon
                      type={transaction.category}
                      className="h-5 w-5"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--text-primary)] font-medium">
                        {transaction.asset_type}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          transaction.transaction_type === "BUY"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2">
                    <div className="flex items-center justify-end text-[10px] text-[var(--text-secondary)]">
                      Qty
                    </div>
                    <div className="text-right text-[var(--text-primary)]">
                      {transaction.quantity.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-end text-[10px] text-[var(--text-secondary)]">
                      Total
                    </div>
                    <div className="text-right text-[var(--text-primary)]">
                      {formatCurrency(
                        transaction.quantity * transaction.price,
                        currency
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {transactions.length === 0 && (
        <div className="p-8 text-center text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-lg">
          No transactions yet
        </div>
      )}
    </div>
  );

  return (
    <>
      <DesktopView />
      <MobileView />
    </>
  );
}