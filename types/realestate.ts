// types/real-estate.ts

// Main real estate property interface
export interface RealEstateProperty {
  id: string
  user_id: string
  portfolio_id: string
  name: string
  property_type: PropertyType
  address?: string | null
  purchase_price: number
  current_value: number
  purchase_date: string // ISO date string
  description?: string | null
  square_feet?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  year_built?: number | null
  lot_size?: number | null
  property_tax?: number | null
  insurance_cost?: number | null
  hoa_fees?: number | null
  rental_income?: number | null
  expenses?: number | null
  created_at: string
  updated_at: string
  encrypted?: boolean
}

// Property types enum
export type PropertyType = 
  | 'Residential'
  | 'Commercial' 
  | 'Industrial'
  | 'Land'
  | 'Multi-Family'
  | 'Condo'
  | 'Townhouse'
  | 'Vacation Rental'
  | 'Office'
  | 'Retail'
  | 'Warehouse'
  | 'Mixed-Use'

// Property creation request
export interface CreatePropertyRequest {
  name: string
  property_type: PropertyType
  address?: string
  purchase_price: number
  current_value: number
  purchase_date: string
  portfolio_id: string
  description?: string
  square_feet?: number
  bedrooms?: number
  bathrooms?: number
  year_built?: number
  lot_size?: number
  property_tax?: number
  insurance_cost?: number
  hoa_fees?: number
  rental_income?: number
  expenses?: number
}

// Property update request
export interface UpdatePropertyRequest {
  name?: string
  property_type?: PropertyType
  address?: string
  purchase_price?: number
  current_value?: number
  purchase_date?: string
  portfolio_id?: string
  description?: string
  square_feet?: number
  bedrooms?: number
  bathrooms?: number
  year_built?: number
  lot_size?: number
  property_tax?: number
  insurance_cost?: number
  hoa_fees?: number
  rental_income?: number
  expenses?: number
}

// Property with calculated metrics
export interface PropertyWithMetrics extends RealEstateProperty {
  gain_loss: number
  gain_loss_percentage: number
  annual_return?: number
  cap_rate?: number // For rental properties
  cash_flow?: number // Rental income minus expenses
  days_owned: number
}

// Property summary for portfolio overview
export interface PropertySummary {
  total_properties: number
  total_value: number
  total_cost: number
  total_gain_loss: number
  total_gain_loss_percentage: number
  average_gain_loss_percentage: number
  properties_by_type: Record<PropertyType, number>
  total_rental_income?: number
  total_expenses?: number
  net_rental_income?: number
}

// Property analytics data
export interface PropertyAnalytics {
  portfolio_id: string
  summary: PropertySummary
  top_performers: PropertyWithMetrics[]
  worst_performers: PropertyWithMetrics[]
  properties_by_type: {
    type: PropertyType
    count: number
    total_value: number
    average_value: number
    gain_loss_percentage: number
  }[]
  monthly_performance?: {
    month: string
    total_value: number
    gain_loss: number
  }[]
}

// Property valuation data
export interface PropertyValuation {
  id: string
  property_id: string
  valuation_date: string
  estimated_value: number
  valuation_method: 'Manual' | 'Automated' | 'Professional Appraisal' | 'Market Analysis'
  source?: string
  notes?: string
  created_at: string
}

// Property transaction/event tracking
export interface PropertyTransaction {
  id: string
  property_id: string
  transaction_type: 'Purchase' | 'Sale' | 'Refinance' | 'Improvement' | 'Repair' | 'Tax Payment' | 'Insurance' | 'Other'
  amount: number
  transaction_date: string
  description?: string
  category?: string
  created_at: string
}

// Property filters for listing/search
export interface PropertyFilters {
  property_type?: PropertyType[]
  min_value?: number
  max_value?: number
  min_purchase_price?: number
  max_purchase_price?: number
  min_gain_loss_percentage?: number
  max_gain_loss_percentage?: number
  purchase_date_from?: string
  purchase_date_to?: string
  has_rental_income?: boolean
  portfolio_id?: string[]
  search_term?: string
  sort_by?: 'name' | 'purchase_date' | 'current_value' | 'gain_loss_percentage' | 'property_type'
  sort_order?: 'asc' | 'desc'
}

// Property export data
export interface PropertyExportData {
  properties: RealEstateProperty[]
  summary: PropertySummary
  export_date: string
  export_format: 'csv' | 'xlsx' | 'json' | 'pdf'
}

// Property dashboard widget data
export interface PropertyDashboardData {
  total_properties: number
  total_value: number
  monthly_change: number
  monthly_change_percentage: number
  recent_transactions: PropertyTransaction[]
  upcoming_valuations: PropertyValuation[]
  top_property: PropertyWithMetrics | null
  alerts: PropertyAlert[]
}

// Property alerts/notifications
export interface PropertyAlert {
  id: string
  property_id: string
  alert_type: 'Valuation Due' | 'Tax Due' | 'Insurance Renewal' | 'Maintenance' | 'Market Update'
  message: string
  severity: 'low' | 'medium' | 'high'
  due_date?: string
  is_dismissed: boolean
  created_at: string
}

// Property comparison data
export interface PropertyComparison {
  properties: PropertyWithMetrics[]
  comparison_metrics: {
    metric: string
    values: Record<string, number> // property_id -> value
  }[]
  summary: {
    best_performer: PropertyWithMetrics
    worst_performer: PropertyWithMetrics
    average_gain_loss: number
    total_value: number
  }
}

// Property market data (if integrating with real estate APIs)
export interface PropertyMarketData {
  property_id: string
  estimated_value: number
  price_per_sqft?: number
  comparable_sales: {
    address: string
    sale_price: number
    sale_date: string
    square_feet?: number
    bedrooms?: number
    bathrooms?: number
  }[]
  market_trends: {
    area_appreciation_rate: number
    median_home_price: number
    days_on_market: number
    inventory_level: 'Low' | 'Medium' | 'High'
  }
  last_updated: string
}

// Form data types for modals
export interface PropertyFormData {
  name: string
  property_type: PropertyType
  address: string
  purchase_price: string
  current_value: string
  purchase_date: string
  portfolio_id: string
  description?: string
  square_feet?: string
  bedrooms?: string
  bathrooms?: string
  year_built?: string
  lot_size?: string
  property_tax?: string
  insurance_cost?: string
  hoa_fees?: string
  rental_income?: string
  expenses?: string
}

// API response types
export interface PropertyApiResponse {
  success: boolean
  property?: RealEstateProperty
  properties?: RealEstateProperty[]
  summary?: PropertySummary
  analytics?: PropertyAnalytics
  error?: string
  message?: string
}

export interface PropertiesListResponse {
  properties: RealEstateProperty[]
  total_count: number
  page: number
  per_page: number
  total_pages: number
  summary: PropertySummary
}

// Constants for dropdowns and validation
export const PROPERTY_TYPES: PropertyType[] = [
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

export const TRANSACTION_TYPES = [
  'Purchase',
  'Sale',
  'Refinance',
  'Improvement',
  'Repair',
  'Tax Payment',
  'Insurance',
  'Other'
] as const

export const VALUATION_METHODS = [
  'Manual',
  'Automated',
  'Professional Appraisal',
  'Market Analysis'
] as const