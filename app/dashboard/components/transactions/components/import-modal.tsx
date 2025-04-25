// app/dashboard/components/transactions/components/import-modal.tsx
'use client'

import { useState } from 'react'
import { X, Upload } from 'lucide-react'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  fileType: 'csv' | 'xlsx' | 'json' | null
  portfolioId?: string
}

export function ImportModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  fileType,
  portfolioId
}: ImportModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const allowedTypes = {
    csv: '.csv',
    xlsx: '.xlsx,.xls',
    json: '.json'
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files?.length) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = async (file: File) => {
    if (!fileType) return

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    const expectedExtension = fileType === 'xlsx' ? ['xlsx', 'xls'] : [fileType]
    
    if (!extension || !expectedExtension.includes(extension)) {
      onError(`Please select a ${fileType.toUpperCase()} file`)
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', fileType)
      
      // Add portfolio ID if available
      if (portfolioId) {
        formData.append('portfolioId', portfolioId)
      }

      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        body: formData
      })

      // If response is not JSON, show the error
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid response from server: ${await response.text()}`)
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import file')
      }

      onSuccess(data.message || 'Successfully imported file')
      onClose()
    } catch (error) {
      console.error('Import error:', error)
      onError(error instanceof Error ? error.message : 'Failed to import file')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const acceptedFileType = fileType ? allowedTypes[fileType] : ''

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Upload className="h-5 w-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Import {fileType?.toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
              : 'border-gray-700 hover:border-[var(--accent-primary)]'
          }`}
        >
          <input
            type="file"
            accept={acceptedFileType}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          
          <div className="flex flex-col items-center gap-4">
            <Upload 
              className={`h-10 w-10 ${
                isDragging ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
              }`} 
            />
            <div className="space-y-2">
              <p className="text-[var(--text-primary)]">
                Drag and drop your file here, or{' '}
                <label
                  htmlFor="file-upload"
                  className="text-[var(--accent-primary)] hover:underline cursor-pointer"
                >
                  browse
                </label>
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Supported format: {fileType?.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[var(--text-secondary)]">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--accent-primary)] border-t-transparent" />
            Importing file...
          </div>
        )}
      </div>
    </div>
  )
}