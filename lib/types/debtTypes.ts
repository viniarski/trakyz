// lib/types/debtTypes.ts

export type Loan = {
  id: string;
  user_id: string;
  portfolio_id: string;
  name: string;
  lender: string;
  loan_type: string;
  original_amount: number;
  current_balance: number;
  interest_rate: number;
  monthly_payment: number;
  payment_day: number;
  term_months: number;
  start_date: string;
  maturity_date: string;
  months_paid: number;
  months_remaining: number;
  next_payment_date: string;
  auto_pay: boolean;
  extra_payments_total: number;
  encrypted: boolean;
  created_at: string;
  updated_at: string;
};

export type CreditCard = {
  id: string;
  user_id: string;
  portfolio_id: string;
  name: string;
  issuer: string;
  last_four: string;
  balance: number;
  credit_limit: number;
  interest_rate: number;
  min_payment: number;
  due_date: string;
  auto_pay: boolean;
  statement_balance: number;
  annual_fee: number;
  rewards_rate: string | null;
  encrypted: boolean;
  created_at: string;
  updated_at: string;
};

export type DebtData = {
  loans: Loan[];
  creditCards: CreditCard[];
};
