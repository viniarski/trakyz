// components/Transactions/components/ExportMenu.tsx

'use client'

import { FileText, File, Database } from 'lucide-react'

interface ExportMenuProps {
  onExport: (type: 'csv' | 'xlsx' | 'json' | 'pdf') => void
  isOpen: boolean
}

export function ExportMenu({ onExport, isOpen }: ExportMenuProps) {
  if (!isOpen) return null

  const exportOptions = [
    {
      type: 'csv' as const,
      label: 'CSV',
      icon: <File className="h-4 w-4" />,
      description: 'Spreadsheet format'
    },
    {
      type: 'xlsx' as const,
      label: 'Excel',
      icon: <FileText className="h-4 w-4" />,
      description: 'Excel workbook'
    },
    {
      type: 'json' as const,
      label: 'JSON',
      icon: <Database className="h-4 w-4" />,
      description: 'Data format'
    },
    {
      type: 'pdf' as const,
      label: 'PDF',
      icon: <FileText className="h-4 w-4" />,
      description: 'Report format'
    }
  ]

  return (
    <div className="absolute top-full right-0 mt-1 w-48 bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--bg-hover)] z-50">
      <div className="p-1">
        {exportOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => onExport(option.type)}
            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--bg-hover)] rounded-md transition-colors"
          >
            <div className="text-[var(--text-secondary)]">
              {option.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {option.label}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}