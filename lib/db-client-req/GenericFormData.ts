export const portfolioFields = {
  user_id: { label: "User ID", type: "text", required: true },
  name: { label: "Portfolio Name", type: "text", required: true },
  is_default: { label: "Is Default", type: "text" },
  total_value: { label: "Total Value", type: "number" },
  total_cost: { label: "Total Cost", type: "number" },
  total_profit_loss: { label: "Profit/Loss", type: "number" },
  total_profit_loss_percentage: { label: "Profit/Loss %", type: "number" },
  asset_count: { label: "Asset Count", type: "number" },
};

export const transactionFields = {
  user_id: { label: "User ID", type: "text", required: true },
  portfolio_id: { label: "Portfolio ID", type: "text", required: true },
  category: { label: "Category", type: "text" },
  asset_type: { label: "Asset Type", type: "text" },
  transaction_type: { label: "Transaction Type", type: "text", required: true },
  quantity: { label: "Quantity", type: "number" },
  price: { label: "Price", type: "number" },
  date: { label: "Date", type: "datetime-local" },
};

export const realEstateFields = {
  user_id: { label: "User ID", type: "text" },
  asset_id: { label: "Asset ID", type: "text" },
  property_type: { label: "Property Type", type: "text" },
  property_address: { label: "Address", type: "text" },
  purchase_price: { label: "Purchase Price", type: "number" },
  current_value: { label: "Current Value", type: "number" },
  purchase_date: { label: "Purchase Date", type: "date" },
  rental_income: { label: "Rental Income", type: "number" },
  mortgage_monthly_payment: { label: "Mortgage Payment", type: "number" },
  mortgage_interest_rate: { label: "Interest Rate", type: "number" },
  property_tax: { label: "Property Tax", type: "number" },
  insurance: { label: "Insurance", type: "number" },
  maintenance_costs: { label: "Maintenance", type: "number" },
  utilities: { label: "Utilities", type: "number" },
};

export const creditCardFields = {
  user_id: { label: "User ID", type: "text", required: true },
  card_name: { label: "Card Name", type: "text", required: true },
  card_issuer: { label: "Issuer", type: "text" },
  credit_limit: { label: "Credit Limit", type: "number" },
  current_balance: { label: "Current Balance", type: "number" },
  interest_rate: { label: "Interest Rate (%)", type: "number" },
  due_date: { label: "Due Date", type: "date" },
  minimum_payment: { label: "Minimum Payment", type: "number" },
};

export const loanFields = {
  user_id: { label: "User ID", type: "text", required: true },
  loan_type: { label: "Loan Type", type: "text", required: true },
  lender: { label: "Lender", type: "text" },
  principal_amount: { label: "Principal Amount", type: "number" },
  remaining_balance: { label: "Remaining Balance", type: "number" },
  interest_rate: { label: "Interest Rate (%)", type: "number" },
  start_date: { label: "Start Date", type: "date" },
  term_months: { label: "Term (months)", type: "number" },
  monthly_payment: { label: "Monthly Payment", type: "number" },
};

export const userPlanFields = {
  plan_type: {
    label: "Plan Type",
    type: "text", // Or maybe a <select> if you want to make it more controlled
    required: true,
  },
  plan_start_date: {
    label: "Start Date",
    type: "datetime-local",
  },
  plan_end_date: {
    label: "End Date",
    type: "datetime-local",
  },
  stripe_customer_id: {
    label: "Stripe Customer ID",
    type: "text",
  },
  stripe_subscription_id: {
    label: "Stripe Subscription ID",
    type: "text",
  },
  subscription_status: {
    label: "Subscription Status",
    type: "text",
  },
  is_early_adopter: {
    label: "Early Adopter?",
    type: "checkbox",
  },
  early_adopter_ending_notified: {
    label: "Early Adopter Ending Notified?",
    type: "checkbox",
  },
  early_adopter_until: {
    label: "Early Adopter Until",
    type: "datetime-local",
  },
  is_free_trial: {
    label: "Free Trial?",
    type: "checkbox",
  },
  free_trial_ending_notified: {
    label: "Free Trial Ending Notified?",
    type: "checkbox",
  },
  free_trial_until: {
    label: "Free Trial Until",
    type: "datetime-local",
  },
} as const;
