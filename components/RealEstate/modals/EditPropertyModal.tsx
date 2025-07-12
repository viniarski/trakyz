// components/RealEstate/modals/EditPropertyModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { RealEstateProperty, PropertyType } from '@/types/realestate'
import type { Portfolio } from '@/types'

interface EditPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (property: Partial<RealEstateProperty>) => Promise<void>
  property: RealEstateProperty | null
  portfolios: Portfolio[]
}

export function EditPropertyModal({
  isOpen,
  onClose,
  onSubmit,
  property,
  portfolios
}: EditPropertyModalProps) {
  const [formData, setFormData] = useState({
    property_address: '',
    property_type: 'single_family' as PropertyType,
    purchase_price: '',
    current_value: '',
    purchase_date: '',
    rental_income: '',
    mortgage_monthly_payment: '',
    mortgage_interest_rate: '',
    property_tax: '',
    insurance: '',
    maintenance_costs: '',
    utilities: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const propertyTypes: PropertyType[] = [
    'single_family',
    'multi_family',
    'condo',
    'townhouse',
    'commercial',
    'land',
    'other'
  ]

  // Populate form when property changes
  useEffect(() => {
    if (property) {
      setFormData({
        property_address: property.property_address || '',
        property_type: property.property_type as PropertyType || 'single_family',
        purchase_price: property.purchase_price?.toString() || '',
        current_value: property.current_value?.toString() || '',
        purchase_date: property.purchase_date || '',
        rental_income: property.rental_income?.toString() || '',
        mortgage_monthly_payment: property.mortgage_monthly_payment?.toString() || '',
        mortgage_interest_rate: property.mortgage_interest_rate?.toString() || '',
        property_tax: property.property_tax?.toString() || '',
        insurance: property.insurance?.toString() || '',
        maintenance_costs: property.maintenance_costs?.toString() || '',
        utilities: property.utilities?.toString() || ''
      })
    }
  }, [property])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        property_address: formData.property_address,
        property_type: formData.property_type,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        current_value: parseFloat(formData.current_value) || 0,
        purchase_date: formData.purchase_date,
        rental_income: formData.rental_income ? parseFloat(formData.rental_income) : undefined,
        mortgage_monthly_payment: formData.mortgage_monthly_payment ? parseFloat(formData.mortgage_monthly_payment) : undefined,
        mortgage_interest_rate: formData.mortgage_interest_rate ? parseFloat(formData.mortgage_interest_rate) : undefined,
        property_tax: formData.property_tax ? parseFloat(formData.property_tax) : undefined,
        insurance: formData.insurance ? parseFloat(formData.insurance) : undefined,
        maintenance_costs: formData.maintenance_costs ? parseFloat(formData.maintenance_costs) : undefined,
        utilities: formData.utilities ? parseFloat(formData.utilities) : undefined
      })
      onClose()
    } catch (error) {
      console.error('Error updating property:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-secondary)] rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--bg-hover)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Edit Property
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Address */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Property Address *
                </label>
                <textarea
                  name="property_address"
                  value={formData.property_address}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  placeholder="Property address"
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
                  <option value="single_family">Single Family</option>
                  <option value="multi_family">Multi Family</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--text-primary)] border-b border-[var(--bg-hover)] pb-2">
                Financial Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="0.00"
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
                    placeholder="0.00"
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

                {/* Rental Income */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Monthly Rental Income
                  </label>
                  <input
                    type="number"
                    name="rental_income"
                    value={formData.rental_income}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Mortgage Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--text-primary)] border-b border-[var(--bg-hover)] pb-2">
                Mortgage Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Mortgage Payment */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Monthly Mortgage Payment
                  </label>
                  <input
                    type="number"
                    name="mortgage_monthly_payment"
                    value={formData.mortgage_monthly_payment}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                    placeholder="0.00"
                  />
                </div>

                {/* Mortgage Interest Rate */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Mortgage Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    name="mortgage_interest_rate"
                    value={formData.mortgage_interest_rate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--text-primary)] border-b border-[var(--bg-hover)] pb-2">
                Operating Expenses
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Tax */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Annual Property Tax
                  </label>
                  <input
                    type="number"
                    name="property_tax"
                    value={formData.property_tax}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                    placeholder="0.00"
                  />
                </div>

                {/* Insurance */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Annual Insurance
                  </label>
                  <input
                    type="number"
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                    placeholder="0.00"
                  />
                </div>

                {/* Maintenance Costs */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Monthly Maintenance Costs
                  </label>
                  <input
                    type="number"
                    name="maintenance_costs"
                    value={formData.maintenance_costs}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                    placeholder="0.00"
                  />
                </div>

                {/* Utilities */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Monthly Utilities
                  </label>
                  <input
                    type="number"
                    name="utilities"
                    value={formData.utilities}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-[var(--bg-hover)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}