// components/RealEstate/components/RealEstateList.tsx

'use client'

import { useState } from 'react'
import { Edit, Trash2, MapPin, Calendar, DollarSign, TrendingUp, TrendingDown, Home } from 'lucide-react'
import type { RealEstateProperty } from '@/types/realestate'

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

  const calculateGainLoss = (currentValue: number, purchasePrice: number) => {
    const gainLoss = currentValue - purchasePrice
    const percentage = ((gainLoss / purchasePrice) * 100)
    return { gainLoss, percentage }
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
      setSortOrder('asc')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-primary)] rounded-lg p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[var(--bg-hover)] rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-[var(--bg-hover)] rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="bg-[var(--bg-primary)] rounded-lg p-8 text-center">
        <Home className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
          No Properties Found
        </h3>
        <p className="text-[var(--text-secondary)]">
          Add your first property to get started with real estate tracking.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-primary)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--bg-hover)]">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-[var(--text-secondary)]">
          <div 
            className="col-span-3 cursor-pointer hover:text-[var(--accent-primary)] flex items-center gap-1"
            onClick={() => handleSort('name')}
          >
            Property Name
            {sortBy === 'name' && (
              <span className="text-xs">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div 
            className="col-span-2 cursor-pointer hover:text-[var(--accent-primary)] flex items-center gap-1"
            onClick={() => handleSort('type')}
          >
            Type
            {sortBy === 'type' && (
              <span className="text-xs">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="col-span-2">Address</div>
          <div 
            className="col-span-2 cursor-pointer hover:text-[var(--accent-primary)] flex items-center gap-1"
            onClick={() => handleSort('value')}
          >
            Current Value
            {sortBy === 'value' && (
              <span className="text-xs">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="col-span-2">Gain/Loss</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>

      {/* Property List */}
      <div className="divide-y divide-[var(--bg-hover)]">
        {sortedProperties.map((property) => {
          const { gainLoss, percentage } = calculateGainLoss(property.current_value, property.purchase_price)
          const isPositive = gainLoss >= 0

          return (
            <div key={property.id} className="px-6 py-4 hover:bg-[var(--bg-hover)] transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Property Name */}
                <div className="col-span-3">
                  <div className="font-medium text-[var(--text-primary)]">
                    {property.name}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(property.purchase_date)}
                  </div>
                </div>

                {/* Type */}
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--bg-hover)] text-[var(--text-primary)]">
                    {property.property_type}
                  </span>
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <div className="text-sm text-[var(--text-secondary)] flex items-start gap-1">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="truncate">
                      {property.address || 'No address provided'}
                    </span>
                  </div>
                </div>

                {/* Current Value */}
                <div className="col-span-2">
                  <div className="font-medium text-[var(--text-primary)]">
                    {formatCurrency(property.current_value)}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    Purchase: {formatCurrency(property.purchase_price)}
                  </div>
                </div>

                {/* Gain/Loss */}
                <div className="col-span-2">
                  <div className={`flex items-center gap-1 ${isPositive ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'}`}>
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <div>
                      <div className="font-medium">
                        {formatCurrency(Math.abs(gainLoss))}
                      </div>
                      <div className="text-xs">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditProperty(property)}
                      className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] rounded transition-colors"
                      title="Edit Property"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProperty(property.id, property.name)}
                      className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-danger)] hover:bg-[var(--bg-hover)] rounded transition-colors"
                      title="Delete Property"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}