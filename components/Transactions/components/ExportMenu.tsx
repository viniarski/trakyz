// components/Transactions/components/ExportMenu.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown, FileSpreadsheet, FileJson, FileText, File } from 'lucide-react'
import { ExportModal } from '@/components/Transactions/modals/ExportModal'
import { Transaction } from '@/types'

interface ExportMenuProps {
  transactions: Transaction[]
  onNotification: (type: 'success' | 'error', message: string) => void
  selectedPortfolio?: string
}

export function ExportMenu({ 
  transactions,
  onNotification, 
  selectedPortfolio
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'json' | 'pdf' | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExportClick = (format: 'csv' | 'xlsx' | 'json' | 'pdf') => {
    setExportFormat(format)
    setShowModal(true)
    setIsOpen(false)
  }

  const handleSuccess = () => {
    onNotification('success', 'Transactions exported successfully')
    setShowModal(false)
    setExportFormat(null)
  }

  const handleError = (message: string) => {
    onNotification('error', message)
  }

  // Use the same style as the Filter button (inactiveButtonClass)
  const baseButtonClass = "text-sm px-3 py-1.5 rounded-md transition-colors font-medium";
  const inactiveButtonClass = "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseButtonClass} ${inactiveButtonClass} flex items-center gap-1.5`}
        disabled={transactions.length === 0}
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden xs:inline">Export</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform hidden xs:block ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--bg-hover)] overflow-hidden z-10">
          <div className="py-1">
            <button
              onClick={() => handleExportClick('csv')}
              className="w-full px-4 py-2 text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              CSV
            </button>
            <button
              onClick={() => handleExportClick('xlsx')}
              className="w-full px-4 py-2 text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel (XLSX)
            </button>
            <button
              onClick={() => handleExportClick('json')}
              className="w-full px-4 py-2 text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
            >
              <FileJson className="h-4 w-4" />
              JSON
            </button>
            <button
              onClick={() => handleExportClick('pdf')}
              className="w-full px-4 py-2 text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
            >
              <File className="h-4 w-4" />
              PDF (Report)
            </button>
          </div>
        </div>
      )}

      {/* Mobile bottom sheet menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] rounded-t-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Export Format</h3>
              <button
                onClick={() => handleExportClick('csv')}
                className="w-full py-3 text-center text-[var(--text-primary)] text-lg border-b border-gray-700"
              >
                CSV
              </button>
              <button
                onClick={() => handleExportClick('xlsx')}
                className="w-full py-3 text-center text-[var(--text-primary)] text-lg border-b border-gray-700"
              >
                Excel (XLSX)
              </button>
              <button
                onClick={() => handleExportClick('json')}
                className="w-full py-3 text-center text-[var(--text-primary)] text-lg border-b border-gray-700"
              >
                JSON
              </button>
              <button
                onClick={() => handleExportClick('pdf')}
                className="w-full py-3 text-center text-[var(--text-primary)] text-lg"
              >
                PDF (Report)
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <ExportModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setExportFormat(null)
          }}
          transactions={transactions}
          fileType={exportFormat}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </div>
  )
}