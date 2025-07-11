// types/realestate.ts

export interface RealEstateProperty {
  id: string
  user_id: string
  asset_id?: string
  property_address: string  // Updated to match database column
  property_type: string
  purchase_price: number
  current_value: number
  purchase_date: string
  rental_income?: number
  mortgage_monthly_payment?: number
  mortgage_interest_rate?: number
  property_tax?: number
  insurance?: number
  maintenance_costs?: number
  utilities?: number
  monthly_cash_flow?: number
  yearly_cash_flow?: number
  encrypted?: boolean
  created_at: string
  updated_at: string
}

export interface RealEstateFormData {
  property_address: string  // Updated to match database column
  property_type: string
  purchase_price: number
  current_value: number
  purchase_date: string
  rental_income?: number
  mortgage_monthly_payment?: number
  mortgage_interest_rate?: number
  property_tax?: number
  insurance?: number
  maintenance_costs?: number
  utilities?: number
}

export type PropertyType = 
  | 'single_family'
  | 'multi_family'
  | 'condo'
  | 'townhouse'
  | 'commercial'
  | 'land'
  | 'other'