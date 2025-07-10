// components/RealEstate/components/RealEstateList.tsx

'use client'

import { useState } from 'react'
import { Edit, Trash2, MapPin, Calendar, DollarSign, TrendingUp, TrendingDown, Home } from 'lucide-react'
import type { RealEstateProperty } from '@/types'

interface RealEstateListProps {
  properties: RealEstateProperty[]
  isLoading: boolean
  onEditProperty: (property: RealEstateProperty) => void
  onDeleteProperty: (id: string, name: string) => void
}

export function RealEstateList({
  properties,
  isLoading,
  onEditProperty,
  onDeleteProperty
}: RealEstateListProps) {
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'date' | 'type'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const sortedProperties = [...properties].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'value':
        aValue = a.current_value
        bValue = b.current_value
        break
      case 'date':
        aValue = new Date(a.purchase_date).getTime()
        bValue = new Date(b.purchase_date).getTime()
        break
      case 'type':
        aValue = a.property_type.toLowerCase()
        bValue = b.property_type.toLowerCase()
        break
      default:
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
    }

    if (typeof aValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  const handleSort = (column: 'name' | 'value' | 'date' | 'type') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-lg p-8 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--text-secondary)]">Loading properties...</span>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-lg p-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="p-4 bg-[var(--bg-hover)] rounded-full">
            <Home className="h-16 w-16 text-[var(--text-secondary)]" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">No Properties Found</h3>
        <p className="text-[var(--text-secondary)] mb-6">
          Start building your real estate portfolio by adding your first property.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-[var(--bg-hover)] px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm font-medium text-[var(--text-secondary)]">
          <button 
            onClick={() => handleSort('name')}
            className="text-left hover:text-[var(--text-primary)] transition-colors"
          >
            Property Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            onClick={() => handleSort('type')}
            className="text-left hover:text-[var(--text-primary)] transition-colors"
          >
            Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            onClick={() => handleSort('value')}
            className="text-left hover:text-[var(--text-primary)] transition-colors"
          >
            Current Value {sortBy === 'value' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <div>Purchase Price</div>
          <button 
            onClick={() => handleSort('date')}
            className="text-left hover:text-[var(--text-primary)] transition-colors"
          >
            Purchase Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <div>Actions</div>
        </div>
      </div>

      {/* Property List */}
      <div className="divide-y divide-[var(--bg-hover)]">
        {sortedProperties.map((property) => {
          const gainLoss = property.current_value - property.purchase_price
          const gainLossPercent = property.purchase_price > 0 
            ? ((gainLoss / property.purchase_price) * 100) 
            : 0

          return (
            <div key={property.id} className="px-6 py-4 hover:bg-[var(--bg-hover)]/30 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                {/* Property Name & Location */}
                <div>
                  <h4 className="font-medium text-[var(--text-primary)]">{property.name}</h4>
                  {property.address && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-[var(--text-secondary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">{property.address}</span>
                    </div>
                  )}
                </div>

                {/* Property Type */}
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-primary-10)] text-[var(--accent-primary)]">
                    {property.property_type}
                  </span>
                </div>

                {/* Current Value */}
                <div>
                  <div className="font-medium text-[var(--text-primary)]">
                    {formatCurrency(property.current_value)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {gainLoss >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-sm ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Purchase Price */}
                <div className="text-[var(--text-primary)]">
                  {formatCurrency(property.purchase_price)}
                </div>

                {/* Purchase Date */}
                <div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[var(--text-secondary)]" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {formatDate(property.purchase_date)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditProperty(property)}
                    className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteProperty(property.id, property.name)}
                    className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}