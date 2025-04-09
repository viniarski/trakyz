export interface RealEstateProperty {
  id: string; // UUID for the property
  user_id: string; // UUID for the user owning the property
  asset_id: string; // UUID referencing the asset in the transactions table
  property_type: string; // Type of the property (e.g., 'Residential', 'Commercial')
  property_address: string; // The address of the property
  purchase_price: number; // The purchase price of the property
  current_value: number; // The current market value of the property
  purchase_date: string; // The date the property was purchased (ISO format string)
  rental_income: number; // Monthly rental income generated from the property
  mortgage_monthly_payment: number; // Monthly mortgage payment
  mortgage_interest_rate: number; // Interest rate on the mortgage
  property_tax: number; // Monthly property tax
  insurance: number; // Monthly property insurance
  maintenance_costs: number; // Monthly maintenance costs for the property
  utilities: number; // Monthly utilities cost for the property
  monthly_cash_flow: number; // Computed value: rental_income minus the monthly expenses (stored column)
  yearly_cash_flow: number; // Computed value: monthly_cash_flow * 12 (stored column)
  encrypted: boolean; // Boolean indicating if the data is encrypted
  created_at: string; // ISO format string of the record creation date
  updated_at: string; // ISO format string of the last record update date
}
