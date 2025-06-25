// app/dashboard/components/portfolio/index.tsx

'use client'

import React, { useState } from "react";
import { Portfolio } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/lib/stores/useCurrencyStore";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatePortfolioModal } from "../../../../components/Portfolios/modals/create-portfolio-modal";
import { AddAsset } from "@/components/AddAsset";

interface PortfoliosProps {
  portfolios: Portfolio[];
  userId: string;
}

const Portfolios: React.FC<PortfoliosProps> = ({ portfolios, userId }) => {
  // State for UI elements
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    portfolios.find(p => p.is_default) || portfolios[0] || null
  );
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  
  // Get currency from store
  const { currency } = useCurrencyStore();

  // Handle portfolio creation
  const handleCreatePortfolio = async (name: string) => {
    try {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portfolio');
      }

      // Refresh the page to show new portfolio
      window.location.reload();
      
    } catch (error) {
      console.error('Error creating portfolio:', error);
      alert('Failed to create portfolio');
    }
  };

  // Handle adding a new asset
  const handleAddTransaction = async (transaction: {
    transaction_type: 'BUY' | 'SELL'
    category: string
    asset_type: string
    quantity: number
    price: number
    date: string
    portfolio_id: string
  }) => {
    if (!selectedPortfolio) return;
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          portfolio_id: transaction.portfolio_id,
          transaction_type: transaction.transaction_type,
          category: transaction.category,
          asset_type: transaction.asset_type,
          quantity: transaction.quantity,
          price: transaction.price,
          date: transaction.date,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add asset');
      }

      // Refresh the page to show new asset
      window.location.reload();
      
      // Close the modal
      setShowAddAsset(false);
      
    } catch (error) {
      console.error('Error adding asset:', error);
      alert('Failed to add asset');
    }
  };

  // Mock market data for AddAsset
  const marketData = {
    metals: [],
    crypto: [],
    stocks: [],
    currencies: [],
  };

  return (
    <div>
      <div className="bg-[var(--bg-secondary)] rounded-xl mt-4">
        {/* Portfolio header */}
        <div className="p-4 flex justify-center items-center">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {/* Portfolio selector */}
            <div className="relative">
              <button
                onClick={() => setIsPortfolioMenuOpen(!isPortfolioMenuOpen)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)] text-[var(--accent-primary)] rounded-lg text-sm transition-colors"
              >
                <span>{selectedPortfolio?.name || "Select Portfolio"}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isPortfolioMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPortfolioMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--bg-hover)] z-50">
                  <div className="max-h-60 overflow-y-auto p-1">
                    {portfolios.map((portfolio) => (
                      <button
                        key={portfolio.id}
                        onClick={() => {
                          setSelectedPortfolio(portfolio);
                          setIsPortfolioMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          selectedPortfolio?.id === portfolio.id
                            ? "bg-[var(--accent-primary-10)] text-[var(--accent-primary)]"
                            : "hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                        }`}
                      >
                        {portfolio.name}
                        {portfolio.is_default && (
                          <span className="ml-1 text-xs text-[var(--text-secondary)]">
                            (Default)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[var(--bg-hover)] p-2">
                    <button
                      onClick={() => {
                        setIsPortfolioMenuOpen(false);
                        setShowCreatePortfolio(true);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                    >
                      <Plus className="h-4 w-4" />
                      <span>New Portfolio</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add Asset button */}
            <button
              onClick={() => setShowAddAsset(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)] text-[var(--accent-primary)] rounded-lg text-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Asset
            </button>
          </div>
        </div>

        {/* Portfolio content */}
        <div className="p-4">
          {portfolios.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--text-secondary)] mb-4">
                You don't have any portfolios yet. Create your first portfolio to get started.
              </p>
              <Button
                onClick={() => setShowCreatePortfolio(true)}
                className="bg-[var(--accent-primary)] text-white"
              >
                Create Portfolio
              </Button>
            </div>
          ) : selectedPortfolio ? (
            <div>
              {/* Portfolio summary */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  {selectedPortfolio.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[var(--bg-hover)]/50 p-4 rounded-lg">
                    <p className="text-sm text-[var(--text-secondary)]">Total Value</p>
                    <p className="text-xl font-bold text-[var(--text-primary)]">
                      {formatCurrency(selectedPortfolio.total_value, currency)}
                    </p>
                  </div>
                  <div className="bg-[var(--bg-hover)]/50 p-4 rounded-lg">
                    <p className="text-sm text-[var(--text-secondary)]">Total Cost</p>
                    <p className="text-xl font-bold text-[var(--text-primary)]">
                      {formatCurrency(selectedPortfolio.total_cost, currency)}
                    </p>
                  </div>
                  <div className="bg-[var(--bg-hover)]/50 p-4 rounded-lg">
                    <p className="text-sm text-[var(--text-secondary)]">Profit/Loss</p>
                    <p className={`text-xl font-bold ${
                      selectedPortfolio.total_profit_loss >= 0 
                        ? "text-green-500" 
                        : "text-red-500"
                    }`}>
                      {formatCurrency(selectedPortfolio.total_profit_loss, currency)}
                      <span className="text-sm ml-1">
                        ({selectedPortfolio.total_profit_loss_percentage.toFixed(2)}%)
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* No assets message if needed */}
              {selectedPortfolio.asset_count === 0 && (
                <div className="text-center py-8 bg-[var(--bg-hover)]/30 rounded-lg">
                  <p className="text-[var(--text-secondary)] mb-4">
                    This portfolio is empty. Add your first asset to get started.
                  </p>
                  <Button
                    onClick={() => setShowAddAsset(true)}
                    className="bg-[var(--accent-primary)] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[var(--text-secondary)]">
                Select a portfolio to view its details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreatePortfolio && (
        <CreatePortfolioModal
          onClose={() => setShowCreatePortfolio(false)}
          onCreatePortfolio={handleCreatePortfolio}
        />
      )}

      {showAddAsset && selectedPortfolio && (
        <AddAsset
          onClose={() => setShowAddAsset(false)}
          onAddTransaction={handleAddTransaction}
          marketData={marketData}
          portfolios={[{ id: selectedPortfolio.id, name: selectedPortfolio.name }]}
          selectedPortfolioId={selectedPortfolio.id}
          title="Add New Asset"
          initialValues={{
            transactionType: 'BUY'
          }}
        />
      )}
    </div>
  );
};

export default Portfolios;