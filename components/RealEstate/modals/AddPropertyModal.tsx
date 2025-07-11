// components/RealEstate/modals/AddPropertyModal.tsx

'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RealEstateFormData } from '@/types/realestate'

interface AddPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RealEstateFormData) => Promise<void>
}

export function AddPropertyModal({ isOpen, onClose, onSubmit }: AddPropertyModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<RealEstateFormData>({
    property_address: '',  // Updated field name
    property_type: 'single_family',
    purchase_price: 0,
    current_value: 0,
    purchase_date: '',
    rental_income: 0,
    mortgage_monthly_payment: 0,
    mortgage_interest_rate: 0,
    property_tax: 0,
    insurance: 0,
    maintenance_costs: 0,
    utilities: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      onClose()
      // Reset form
      setFormData({
        property_address: '',
        property_type: 'single_family',
        purchase_price: 0,
        current_value: 0,
        purchase_date: '',
        rental_income: 0,
        mortgage_monthly_payment: 0,
        mortgage_interest_rate: 0,
        property_tax: 0,
        insurance: 0,
        maintenance_costs: 0,
        utilities: 0
      })
    } catch (error) {
      console.error('Error adding property:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof RealEstateFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Add New Property</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Property Address
              </label>
              <input
                type="text"
                value={formData.property_address}
                onChange={(e) => handleInputChange('property_address', e.target.value)}
                className="w-full p-3 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
                placeholder="123 Main St, City, State 12345"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Property Type
              </label>
              <select
                value={formData.property_type}
                onChange={(e) => handleInputChange('property_type', e.target.value)}
                className="w-full p-3 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
              >
                <option value="single_family">Single Family Home</option>
                <option value="multi_family">Multi-Family</option>
                <option value="condo">Condominium</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Purchase Price
                </label>
                <input
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => handleInputChange('purchase_price', Number(e.target.value))}
                  className="w-full p-3 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="250000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Current Value
                </label>
                <input
                  type="number"
                  value={formData.current_value}
                  onChange={(e) => handleInputChange('current_value', Number(e.target.value))}
                  className="w-full p-3 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="275000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                className="w-full p-3 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
                required
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Financial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Monthly Rental Income
                </label>
                <input
                  type="number"
                  value={formData.rental_income}
                  onChange={(e) => handleInputChange('rental_income', Number(e.target.value))}
                  className="w-full p-3 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="2000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Monthly Mortgage Payment
                </label>
                <input
                  type="number"
                  value={formData.mortgage_monthly_payment}
                  onChange={(e) => handleInputChange('mortgage_monthly_payment', Number(e.target.value))}
                  className="w-full p-3 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="1500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Mortgage Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.mortgage_interest_rate}
                  onChange={(e) => handleInputChange('mortgage_interest_rate', Number(e.target.value))}
                  className="w-full p-3 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="6.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Annual Property Tax
                </label>
                <input
                  type="number"
                  value={formData.property_tax}
                  onChange={(e) => handleInputChange('property_tax', Number(e.target.value))}
                  className="w-full p-3 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="3000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Annual Insurance
                </label>
                <input
                  type="number"
                  value={formData.insurance}
                  onChange={(e) => handleInputChange('insurance', Number(e.target.value))}
                  className="w-full p-3 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="1200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Monthly Maintenance
                </label>
                <input
                  type="number"
                  value={formData.maintenance_costs}
                  onChange={(e) => handleInputChange('maintenance_costs', Number(e.target.value))}
                  className="w-full p-3 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Monthly Utilities
                </label>
                <input
                  type="number"
                  value={formData.utilities}
                  onChange={(e) => handleInputChange('utilities', Number(e.target.value))}
                  className="w-full p-3 rounded-lg bg-[var(--bg-hover)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="150"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/80"
            >
              {loading ? 'Adding...' : 'Add Property'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}