// components/Transactions/modals/ExportModal.tsx

'use client'

import { useState } from 'react'
import { X, Download, FileText, File, Database } from 'lucide-react'
import { Transaction } from '@/types'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onError: (message: string) => void
  fileType: 'csv' | 'xlsx' | 'json' | 'pdf'
  transactions: Transaction[]
}

export function ExportModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  fileType,
  transactions
}: ExportModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getFileIcon = () => {
    switch (fileType) {
      case 'csv':
        return <File className="h-5 w-5 text-green-500" />
      case 'xlsx':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'json':
        return <Database className="h-5 w-5 text-purple-500" />
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      default:
        return <File className="h-5 w-5" />
    }
  }

  const getFileDescription = () => {
    switch (fileType) {
      case 'csv':
        return 'Comma-separated values file that can be opened in Excel, Google Sheets, or any spreadsheet application.'
      case 'xlsx':
        return 'Excel spreadsheet file with formatting and formulas preserved.'
      case 'json':
        return 'JavaScript Object Notation file for importing into other applications or databases.'
      case 'pdf':
        return 'Portable Document Format file for viewing and printing transaction reports.'
      default:
        return 'Export your transactions in the selected format.'
    }
  }

  const handleExport = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/transactions/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          format: fileType
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to export transactions')
      }

      // Handle different response types
      if (fileType === 'pdf') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        const blob = new Blob([data.content], { 
          type: fileType === 'csv' ? 'text/csv' : 
                fileType === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                'application/json'
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.${fileType}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      onSuccess()
    } catch (error) {
      console.error('Export error:', error)
      onError(error instanceof Error ? error.message : 'Failed to export transactions')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Export as {fileType.toUpperCase()}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* File Description */}
        <div className="bg-[var(--bg-hover)] rounded-lg p-4 mb-6">
          <p className="text-sm text-[var(--text-secondary)]">
            {getFileDescription()}
          </p>
        </div>

        {/* Export Info */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Format:</span>
            <span className="text-[var(--text-primary)] font-medium">{fileType.toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Transactions:</span>
            <span className="text-[var(--text-primary)] font-medium">{transactions.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">File name:</span>
            <span className="text-[var(--text-primary)] font-medium">
              transactions_{new Date().toISOString().split('T')[0]}.{fileType}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="flex-1 bg-[var(--accent-primary)] text-white py-2 px-4 rounded-lg hover:bg-[var(--accent-primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              'Exporting...'
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}