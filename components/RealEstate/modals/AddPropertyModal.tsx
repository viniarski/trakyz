// components/RealEstate/modals/AddPropertyModal.tsx

'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { RealEstateProperty, PropertyType } from '@/types/realestate'
import type { Portfolio } from '@/types'

interface AddPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (property: Partial<RealEstateProperty>) => Promise<void>
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
    property_type: 'Residential' as PropertyType,
    address: '',
    purchase_price: '',
    current_value: '',
    purchase_date: '',
    portfolio_id: selectedPortfolio,
    description: '',
    square_feet: '',
    bedrooms: '',
    bathrooms: '',
    year_built: '',
    lot_size: '',
    property_tax: '',
    insurance_cost: '',
    hoa_fees: '',
    rental_income: '',
    expenses: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const propertyTypes: PropertyType[] = [
    'Residential',
    'Commercial',
    'Industrial',
    'Land',
    'Multi-Family',
    'Condo',
    'Townhouse',
    'Vacation Rental',
    'Office',
    'Retail',
    'Warehouse',
    'Mixed-Use'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        name: formData.name,
        property_type: formData.property_type,
        address: formData.address || null,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        current_value: parseFloat(formData.current_value) || 0,
        purchase_date: formData.purchase_date,
        portfolio_id: formData.portfolio_id || selectedPortfolio,
        description: formData.description || null,
        square_feet: formData.square_feet ? parseFloat(formData.square_feet) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        lot_size: formData.lot_size ? parseFloat(formData.lot_size) : null,
        property_tax: formData.property_tax ? parseFloat(formData.property_tax) : null,
        insurance_cost: formData.insurance_cost ? parseFloat(formData.insurance_cost) : null,
        hoa_fees: formData.hoa_fees ? parseFloat(formData.hoa_fees) : null,
        rental_income: formData.rental_income ? parseFloat(formData.rental_income) : null,
        expenses: formData.expenses ? parseFloat(formData.expenses) : null
      })
      
      // Reset form
      setFormData({
        name: '',
        property_type: 'Residential',
        address: '',
        purchase_price: '',
        current_value: '',
        purchase_date: '',
        portfolio_id: selectedPortfolio,
        description: '',
        square_feet: '',
        bedrooms: '',
        bathrooms: '',
        year_built: '',
        lot_size: '',
        property_tax: '',
        insurance_cost: '',
        hoa_fees: '',
        rental_income: '',
        expenses: ''
      })
    } catch (error) {
      console.error('Error adding property:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-primary)] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--bg-hover)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Add New Property
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                placeholder="Property address"
              />
            </div>

            {/* Portfolio */}
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
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              Financial Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Monthly Expenses */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Monthly Expenses
                </label>
                <input
                  type="number"
                  name="expenses"
                  value={formData.expenses}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              Property Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Square Feet */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Square Feet
                </label>
                <input
                  type="number"
                  name="square_feet"
                  value={formData.square_feet}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  placeholder="0"
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  placeholder="0"
                />
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  placeholder="0"
                />
              </div>

              {/* Year Built */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Year Built
                </label>
                <input
                  type="number"
                  name="year_built"
                  value={formData.year_built}
                  onChange={handleChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                  placeholder="YYYY"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--bg-hover)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                placeholder="Property description, notes, or additional details..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--bg-hover)]">
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
              className="px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}