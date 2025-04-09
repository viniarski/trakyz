import GenericForm from "@/components/GenericForm";
import { portfolioFields } from "@/lib/db-client-req/GenericFormData";
import { Portfolio } from "@/lib/types/portfolioTypes";

interface PortfoliosProps {
  portfolios: Portfolio[];
  userId: string;
}

const Portfolios: React.FC<PortfoliosProps> = ({ portfolios, userId }) => {
  // logging portfolios output for easier mapping later
  console.log(portfolios);

  // logging userid for usage later
  console.log(userId);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Portfolios</h2>
      {portfolios.length === 0 ? (
        <p>No portfolios found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold">{portfolio.name}</h3>
              <p>Total Value: ${portfolio.total_value}</p>
              <p>Assets: {portfolio.asset_count}</p>
              <p>
                P/L: ${portfolio.total_profit_loss} (
                {portfolio.total_profit_loss_percentage}%)
              </p>
            </div>
          ))}
        </div>
      )}
      <GenericForm
        apiRoute="/api/portfolios"
        userId={userId}
        fields={portfolioFields}
      />
    </div>
  );
};

export default Portfolios;
