// app/dashboard/components/transactions/Transactions.tsx

import GenericForm from "@/components/GenericForm";
import { transactionFields } from "@/lib/db-client-req/GenericFormData";
import { Transaction } from "@/types";

interface TransactionsProps {
  transactions: Transaction[];
  userId: string;
}

const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  userId,
}) => {
  // logging the real estate output for easier mapping later
  console.log(transactions);

  // logging userid for usage later
  console.log(userId);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions recorded.</p>
      ) : (
        <ul className="space-y-4">
          {transactions.map((tx) => (
            <li key={tx.id} className="border p-4 rounded-lg shadow-sm">
              <p>
                <strong>{tx.transaction_type}</strong> {tx.quantity} of{" "}
                {tx.category}
              </p>
              <p>Asset Type: {tx.asset_type}</p>
              <p>Price: ${tx.price}</p>
              <p>Date: {new Date(tx.date).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
      <GenericForm
        apiRoute="/api/transactions"
        userId={userId}
        fields={transactionFields}
      />
    </div>
  );
};

export default Transactions;
