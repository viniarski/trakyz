// components/Transactions/components/export-menu.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown, FileSpreadsheet, FileJson, FileText, File } from 'lucide-react'
import { ExportModal } from './ExportModal'
import { CurrencyCode, Currency, Crypto } from '@/types'

interface ExportMenuProps {
  onNotification: (type: 'success' | 'error', message: string) => void
  selectedCurrency: CurrencyCode
  currencyRates: { currencies: Currency[] | null; crypto: Crypto[] | null }
  selectedPortfolio?: string // Added this property
}

export function ExportMenu({ 
  onNotification, 
  selectedCurrency, 
  currencyRates,
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

  // Use the same style as the Filter button (inactiveButtonClass)
  const baseButtonClass = "text-sm px-3 py-1.5 rounded-md transition-colors font-medium";
  const inactiveButtonClass = "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseButtonClass} ${inactiveButtonClass} flex items-center gap-1.5`}
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden xs:inline">Export</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform hidden xs:block ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Desktop Dropdown (md and above) */}
      {isOpen && (
        <div className="hidden md:block absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--bg-hover)] overflow-hidden z-10">
          <button
            onClick={() => handleExportClick('csv')}
            className="w-full px-4 py-2 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <FileText className="h-4 w-4" />
            CSV
          </button>
          <button
            onClick={() => handleExportClick('xlsx')}
            className="w-full px-4 py-2 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel (XLSX)
          </button>
          <button
            onClick={() => handleExportClick('json')}
            className="w-full px-4 py-2 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <FileJson className="h-4 w-4" />
            JSON
          </button>
          <button
            onClick={() => handleExportClick('pdf')}
            className="w-full px-4 py-2 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <File className="h-4 w-4" />
            PDF (Report)
          </button>
        </div>
      )}

      {/* Mobile Bottom-Up Menu (below md) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setIsOpen(false)}>
          <div className="bg-black bg-opacity-25 flex-grow" />
          <div 
            className="bg-[var(--bg-secondary)] rounded-t-xl p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-500 rounded-full mx-auto mb-4"></div>
            <div className="flex flex-col">
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
          onClose={() => setShowModal(false)}
          exportFormat={exportFormat}
          onNotification={onNotification}
          selectedCurrency={selectedCurrency}
          currencyRates={currencyRates}
          initialPortfolioId={selectedPortfolio}
        />
      )}
    </div>
  )
}