// components/RealEstate/modals/AddPropertyModal.tsx

'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { RealEstateProperty, Portfolio } from '@/types'

interface AddPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (property: Partial<RealEstateProperty>) => void
  portfolios: Portfolio[]
  selectedPortfolio: string
}

export function AddPropertyModal({
  isOpen,
  onClose,
  onSubmit,
  portfolios,
  selectedPortfolio
}: AddPropertyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    property_type: 'Residential',
    address: '',
    purchase_price: '',
    current_value: '',
    purchase_date: '',
    portfolio_id: selectedPortfolio
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const propertyTypes = [
    'Residential',
    'Commercial',
    'Industrial',
    'Land',
    'Multi-Family',
    'Condo',
    'Townhouse',
    'Vacation Rental'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        ...formData,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        current_value: parseFloat(formData.current_value) || 0,
        portfolio_id: formData.portfolio_id || selectedPortfolio
      })
      
      // Reset form
      setFormData({
        name: '',
        property_type: 'Residential',
        address: '',
        purchase_price: '',
        current_value: '',
        purchase_date: '',
        portfolio_id: selectedPortfolio
      })
    } catch (error) {
      console.error('Error adding property:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-secondary)] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--bg-hover)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Add Property</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Property Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Property Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
              placeholder="e.g., Downtown Apartment"
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Property Type *
            </label>
            <select
              name="property_type"
              value={formData.property_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
            >
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] resize-none"
              placeholder="123 Main St, City, State 12345"
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Purchase Price *
            </label>
            <input
              type="number"
              name="purchase_price"
              value={formData.purchase_price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
              placeholder="250000"
            />
          </div>

          {/* Current Value */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Current Value *
            </label>
            <input
              type="number"
              name="current_value"
              value={formData.current_value}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
              placeholder="275000"
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Purchase Date *
            </label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
            />
          </div>

          {/* Portfolio Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Portfolio *
            </label>
            <select
              name="portfolio_id"
              value={formData.portfolio_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
            >
              {portfolios.map(portfolio => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                  {portfolio.is_default ? ' (Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-secondary)] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}