// app/dashboard/components/analytics/Analytics.tsx

import { DebtData, Portfolio, Transaction } from "@/types";

interface AnalyticsProps {
  portfolios: Portfolio[];
  transactions: Transaction[];
  debtData: DebtData;
  userId: string;
}

export default function Analytics({
  portfolios,
  transactions,
  debtData,
  userId,
}: AnalyticsProps) {
  const { loans, creditCards } = debtData;

  // Logged here for easier mapping later
  console.log(debtData);
  console.log(transactions);
  console.log(portfolios);

  // Logging user to ensure its avaliable to the component
  console.log(userId);
  return (
    <div>
      <p>Analytics</p>
    </div>
  );
}
