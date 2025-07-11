// components/RealEstate/components/RealEstateList.tsx

'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Search, MapPin, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import type { RealEstateProperty } from '@/types/realestate'

interface RealEstateListProps {
  properties: RealEstateProperty[]
  isLoading: boolean
  onEditProperty: (property: RealEstateProperty) => void
  onDeleteProperty: (id: string, address: string) => void
}

type SortField = 'address' | 'value' | 'purchase_date' | 'type' | 'cash_flow'
type SortDirection = 'asc' | 'desc'

export function RealEstateList({
  properties,
  isLoading,
  onEditProperty,
  onDeleteProperty
}: RealEstateListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('purchase_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const { formatPreciseValue } = useCurrencyConverter()

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedProperties = useMemo(() => {
    // Filter properties based on search term
    let filtered = properties.filter(property => {
      const searchLower = searchTerm.toLowerCase()
      return (
        property.property_address?.toLowerCase().includes(searchLower) ||
        property.property_type?.toLowerCase().includes(searchLower)
      )
    })

    // Sort properties
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'address':
          aValue = a.property_address?.toLowerCase() || ''
          bValue = b.property_address?.toLowerCase() || ''
          break
        case 'value':
          aValue = a.current_value || 0
          bValue = b.current_value || 0
          break
        case 'purchase_date':
          aValue = new Date(a.purchase_date || 0).getTime()
          bValue = new Date(b.purchase_date || 0).getTime()
          break
        case 'type':
          aValue = a.property_type?.toLowerCase() || ''
          bValue = b.property_type?.toLowerCase() || ''
          break
        case 'cash_flow':
          aValue = a.monthly_cash_flow || 0
          bValue = b.monthly_cash_flow || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [properties, searchTerm, sortBy, sortDirection])

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-left font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
    >
      {children}
      {sortBy === field && (
        sortDirection === 'asc' ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />
      )}
    </button>
  )

  const formatPropertyType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      // Use consistent formatting to avoid hydration issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}/${day}/${year}`
    } catch {
      return 'N/A'
    }
  }

  const calculateGainLoss = (property: RealEstateProperty) => {
    const gain = (property.current_value || 0) - (property.purchase_price || 0)
    const percentage = property.purchase_price ? (gain / property.purchase_price) * 100 : 0
    return { gain, percentage }
  }

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
          <span className="ml-2 text-[var(--text-secondary)]">Loading properties...</span>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No Properties Found</h3>
          <p className="text-[var(--text-secondary)]">
            Get started by adding your first property to track its value and performance.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
      {/* Search and Filters */}
      <div className="p-4 border-b border-[var(--bg-hover)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search properties by address or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-hover)] rounded-lg border-0 focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
          />
        </div>
      </div>

      {/* Properties Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--bg-hover)]">
              <th className="text-left p-4">
                <SortButton field="address">Property Address</SortButton>
              </th>
              <th className="text-left p-4">
                <SortButton field="type">Type</SortButton>
              </th>
              <th className="text-right p-4">
                <SortButton field="value">Current Value</SortButton>
              </th>
              <th className="text-right p-4">
                Purchase Price
              </th>
              <th className="text-right p-4">
                Gain/Loss
              </th>
              <th className="text-right p-4">
                <SortButton field="cash_flow">Monthly Cash Flow</SortButton>
              </th>
              <th className="text-right p-4">
                <SortButton field="purchase_date">Purchase Date</SortButton>
              </th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProperties.map((property) => {
              const { gain, percentage } = calculateGainLoss(property)
              const isPositiveGain = gain >= 0
              const isPositiveCashFlow = (property.monthly_cash_flow || 0) >= 0

              return (
                <tr 
                  key={property.id} 
                  className="border-b border-[var(--bg-hover)] hover:bg-[var(--bg-hover)]/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-[var(--text-secondary)] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {property.property_address}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--bg-hover)] text-[var(--text-primary)]">
                      {formatPropertyType(property.property_type || 'Unknown')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="h-4 w-4 text-[var(--text-secondary)]" />
                      <span className="font-medium text-[var(--text-primary)]">
                        {formatPreciseValue(property.current_value || 0)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-[var(--text-secondary)]">
                      {formatPreciseValue(property.purchase_price || 0)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isPositiveGain ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <div className="text-right">
                        <div className={`font-medium ${isPositiveGain ? 'text-green-500' : 'text-red-500'}`}>
                          {formatPreciseValue(Math.abs(gain))}
                        </div>
                        <div className={`text-sm ${isPositiveGain ? 'text-green-500' : 'text-red-500'}`}>
                          ({percentage >= 0 ? '+' : ''}{percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className={`font-medium ${isPositiveCashFlow ? 'text-green-500' : 'text-red-500'}`}>
                      {property.monthly_cash_flow !== undefined ? 
                        `${isPositiveCashFlow ? '+' : ''}${formatPreciseValue(property.monthly_cash_flow)}` 
                        : 'N/A'
                      }
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
                      <span className="text-[var(--text-secondary)]">
                        {formatDate(property.purchase_date)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEditProperty(property)}
                        className="px-3 py-1 text-sm bg-[var(--bg-hover)] text-[var(--text-primary)] rounded hover:bg-[var(--accent-primary)]/20 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteProperty(property.id, property.property_address || 'Unknown Property')}
                        className="px-3 py-1 text-sm bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {filteredAndSortedProperties.length > 0 && (
        <div className="p-4 bg-[var(--bg-hover)]/30 border-t border-[var(--bg-hover)]">
          <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
            <span>
              Showing {filteredAndSortedProperties.length} of {properties.length} properties
            </span>
            <span>
              Total Value: {formatPreciseValue(
                filteredAndSortedProperties.reduce((sum, p) => sum + (p.current_value || 0), 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}