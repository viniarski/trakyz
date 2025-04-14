export type UserSubscription = {
  id: string; // UUID
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string; // Consider using a union type if you have a finite list of statuses
  subscription_start_date: string | null; // ISO string from TIMESTAMPTZ
  subscription_end_date: string | null; // ISO string from TIMESTAMPTZ
  is_trial: boolean;
  trial_ending_notified: boolean;
  trial_until: string | null; // TIMESTAMPTZ
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
};
