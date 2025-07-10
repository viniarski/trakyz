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
import type { RealEstateProperty, Portfolio } from '@/types'

interface RealEstateProps {
  portfolios: Portfolio[]
  userId: string
}

export default function RealEstate({
  portfolios,
  userId
}: RealEstateProps) {
  const [properties, setProperties] = useState<RealEstateProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState<RealEstateProperty | null>(null)
  const [deletingProperty, setDeletingProperty] = useState<{ id: string; name: string } | null>(null)
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('')

  // Get default portfolio
  useEffect(() => {
    const defaultPortfolio = portfolios.find(p => p.is_default) || portfolios[0]
    if (defaultPortfolio) {
      setSelectedPortfolio(defaultPortfolio.id)
    }
  }, [portfolios])

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/real-estate')
        if (response.ok) {
          const data = await response.json()
          setProperties(data.properties || [])
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const handleAddProperty = async (propertyData: Partial<RealEstateProperty>) => {
    try {
      const response = await fetch('/api/real-estate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...propertyData,
          portfolio_id: selectedPortfolio,
        }),
      })

      if (response.ok) {
        const newProperty = await response.json()
        setProperties(prev => [...prev, newProperty])
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('Error adding property:', error)
    }
  }

  const handleEditProperty = async (propertyData: Partial<RealEstateProperty>) => {
    if (!editingProperty) return

    try {
      const response = await fetch(`/api/real-estate/${editingProperty.id}`, {
        method: 'PUT',
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
      }
    } catch (error) {
      console.error('Error updating property:', error)
    }
  }

  const handleDeleteProperty = async () => {
    if (!deletingProperty) return

    try {
      const response = await fetch(`/api/real-estate/${deletingProperty.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProperties(prev => prev.filter(p => p.id !== deletingProperty.id))
        setDeletingProperty(null)
      }
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  return (
    <div className="space-y-0">
      <RealEstateHeader
        onAddProperty={() => setShowAddModal(true)}
        portfolios={portfolios}
        selectedPortfolio={selectedPortfolio}
        setSelectedPortfolio={setSelectedPortfolio}
        totalProperties={properties.length}
        totalValue={properties.reduce((sum, p) => sum + p.current_value, 0)}
      />

      <div className="p-4">
        <RealEstateList
          properties={properties}
          isLoading={isLoading}
          onEditProperty={setEditingProperty}
          onDeleteProperty={(id, name) => setDeletingProperty({ id, name })}
        />
      </div>

      {/* Modals */}
      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProperty}
        portfolios={portfolios}
        selectedPortfolio={selectedPortfolio}
      />

      {editingProperty && (
        <EditPropertyModal
          isOpen={!!editingProperty}
          onClose={() => setEditingProperty(null)}
          onSubmit={handleEditProperty}
          property={editingProperty}
          portfolios={portfolios}
        />
      )}

      {deletingProperty && (
        <DeletePropertyModal
          isOpen={!!deletingProperty}
          onClose={() => setDeletingProperty(null)}
          onConfirm={handleDeleteProperty}
          propertyName={deletingProperty.name}
        />
      )}
    </div>
  )
}