// components/Transactions/components/TransactionsList.tsx

'use client'

import { Transaction, CurrencyCode } from '@/types'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

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
  transactions: Transaction[]
  sortKey: SortKey
  sortOrder: SortOrder
  onSort: (key: SortKey) => void
  currency: CurrencyCode
}

export function TransactionsList({
  transactions,
  sortKey,
  sortOrder,
  onSort,
  currency
}: TransactionsListProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value)
  }

  const formatQuantity = (value: number): string => {
    return value.toFixed(8).replace(/\.?0+$/, '')
  }

  // Remove the local formatDate function - use the one from utils instead

  const getSortIcon = (column: SortKey) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="h-3 w-3 text-[var(--text-tertiary)]" />
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-[var(--accent-primary)]" />
      : <ArrowDown className="h-3 w-3 text-[var(--accent-primary)]" />
  }

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--text-secondary)]">No transactions found</p>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Add your first transaction to get started
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-[var(--bg-hover)]">
          <tr>
            <th className="text-left p-3">
              <button
                onClick={() => onSort('date')}
                className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Date
                {getSortIcon('date')}
              </button>
            </th>
            <th className="text-left p-3">
              <button
                onClick={() => onSort('transaction_type')}
                className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Type
                {getSortIcon('transaction_type')}
              </button>
            </th>
            <th className="text-left p-3">
              <button
                onClick={() => onSort('category')}
                className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Category
                {getSortIcon('category')}
              </button>
            </th>
            <th className="text-left p-3">
              <button
                onClick={() => onSort('asset_type')}
                className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Asset
                {getSortIcon('asset_type')}
              </button>
            </th>
            <th className="text-right p-3">
              <button
                onClick={() => onSort('quantity')}
                className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-auto"
              >
                Quantity
                {getSortIcon('quantity')}
              </button>
            </th>
            <th className="text-right p-3">
              <button
                onClick={() => onSort('price')}
                className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-auto"
              >
                Price
                {getSortIcon('price')}
              </button>
            </th>
            <th className="text-right p-3">
              <button
                onClick={() => onSort('total')}
                className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-auto"
              >
                Total
                {getSortIcon('total')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr 
              key={transaction.id}
              className="border-b border-[var(--bg-hover)] hover:bg-[var(--bg-hover)]/30 transition-colors"
            >
              <td className="p-3">
                <span className="text-sm text-[var(--text-primary)]">
                  {formatDate(transaction.date, "short")}
                </span>
              </td>
              <td className="p-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  transaction.transaction_type === 'BUY'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {transaction.transaction_type}
                </span>
              </td>
              <td className="p-3">
                <span className="text-sm text-[var(--text-primary)]">
                  {transaction.category}
                </span>
              </td>
              <td className="p-3">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {transaction.asset_type}
                </span>
              </td>
              <td className="p-3 text-right">
                <span className="text-sm text-[var(--text-primary)]">
                  {formatQuantity(transaction.quantity)}
                </span>
              </td>
              <td className="p-3 text-right">
                <span className="text-sm text-[var(--text-primary)]">
                  {formatCurrency(transaction.price)}
                </span>
              </td>
              <td className="p-3 text-right">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {formatCurrency(transaction.quantity * transaction.price)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}