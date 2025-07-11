// app/dashboard/components/real-estate/RealEstate.tsx

'use client'

import { useState, useEffect } from 'react'
import { 
  RealEstateHeader,
  RealEstateList,
  AddPropertyModal,
  EditPropertyModal,
  DeletePropertyModal
} from '@/components/RealEstate'
import type { RealEstateProperty } from '@/types/realestate'
import type { Portfolio } from '@/types'

interface RealEstateProps {
  portfolios: Portfolio[]
  userId: string
  initialProperties?: RealEstateProperty[] // Add this to use server-side data
}

export default function RealEstate({
  portfolios = [], // Default to empty array
  userId,
  initialProperties = [] // Add initial properties prop
}: RealEstateProps) {
  const [properties, setProperties] = useState<RealEstateProperty[]>(initialProperties)
  const [isLoading, setIsLoading] = useState(false) // Start with false if we have initial data
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState<RealEstateProperty | null>(null)
  const [deletingProperty, setDeletingProperty] = useState<{ id: string; name: string } | null>(null)
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('')

  // Get default portfolio
  useEffect(() => {
    if (portfolios && portfolios.length > 0) {
      const defaultPortfolio = portfolios.find(p => p.is_default) || portfolios[0]
      if (defaultPortfolio) {
        setSelectedPortfolio(defaultPortfolio.id)
      }
    }
  }, [portfolios])

  // Fetch properties (only if we don't have initial properties)
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/real-estate')
        if (response.ok) {
          const data = await response.json()
          // FIX: Handle both response formats
          if (Array.isArray(data)) {
            // API returns array directly
            setProperties(data)
          } else if (data.properties) {
            // API returns object with properties field
            setProperties(data.properties)
          } else {
            // Fallback
            setProperties([])
          }
        } else {
          console.error('Failed to fetch properties:', response.statusText)
          setProperties([])
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
        setProperties([])
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if we don't have initial properties
    if (initialProperties.length === 0) {
      fetchProperties()
    }
  }, [initialProperties.length])

  const handleAddProperty = async (propertyData: any) => {
    try {
      const response = await fetch('/api/real-estate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...propertyData,
          portfolio_id: propertyData.portfolio_id || selectedPortfolio,
        }),
      })

      if (response.ok) {
        const newProperty = await response.json()
        setProperties(prev => [...prev, newProperty])
        setShowAddModal(false)
      } else {
        console.error('Failed to add property:', response.statusText)
      }
    } catch (error) {
      console.error('Error adding property:', error)
    }
  }

  const handleEditProperty = async (propertyData: any) => {
    if (!editingProperty) return

    try {
      const response = await fetch(`/api/real-estate/${editingProperty.id}`, {
        method: 'PATCH', // Use PATCH instead of PUT to match your API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      })

      if (response.ok) {
        const updatedProperty = await response.json()
        setProperties(prev => 
          prev.map(p => p.id === editingProperty.id ? updatedProperty : p)
        )
        setEditingProperty(null)
      } else {
        console.error('Failed to update property:', response.statusText)
      }
    } catch (error) {
      console.error('Error updating property:', error)
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/real-estate/${propertyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProperties(prev => prev.filter(p => p.id !== propertyId))
        setDeletingProperty(null)
      } else {
        console.error('Failed to delete property:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  const handleEditClick = (property: RealEstateProperty) => {
    setEditingProperty(property)
  }

  const handleDeleteClick = (id: string, address: string) => {
    setDeletingProperty({ id, name: address }) // Use address as name
  }

  const handlePortfolioChange = (portfolioId: string) => {
    setSelectedPortfolio(portfolioId)
  }

  return (
    <div className="space-y-6">
      <RealEstateHeader
        onAddProperty={() => setShowAddModal(true)}
        portfolios={portfolios}
        selectedPortfolio={selectedPortfolio}
        onPortfolioChange={handlePortfolioChange}
        properties={properties}
      />

      <RealEstateList
        properties={properties}
        isLoading={isLoading}
        onEditProperty={handleEditClick}
        onDeleteProperty={handleDeleteClick}
      />

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProperty}
      />

      {/* Edit Property Modal */}
      {editingProperty && (
        <EditPropertyModal
          isOpen={!!editingProperty}
          onClose={() => setEditingProperty(null)}
          onSubmit={handleEditProperty}
          property={editingProperty}
          portfolios={portfolios} // Add missing portfolios prop
        />
      )}

      {/* Delete Property Modal */}
      <DeletePropertyModal
        isOpen={!!deletingProperty}
        onClose={() => setDeletingProperty(null)}
        onConfirm={() => {
          if (deletingProperty) {
            handleDeleteProperty(deletingProperty.id)
          }
        }}
        propertyName={deletingProperty?.name || ''}
      />
    </div>
  )
}