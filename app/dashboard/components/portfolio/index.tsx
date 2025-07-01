// app/dashboard/components/portfolio/index.tsx

'use client'

import React, { useState } from "react";
import { Portfolio, Transaction, MarketData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/lib/stores/useCurrencyStore";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatePortfolioModal } from "../../../../components/Portfolios/modals/create-portfolio-modal";
import { AddAsset } from "@/components/AddAsset";

interface PortfoliosProps {
  portfolios: Portfolio[];
  transactions: Transaction[];
  marketData: MarketData;
  userId: string;
}

const Portfolios: React.FC<PortfoliosProps> = ({ 
  portfolios, 
  transactions, 
  marketData, 
  userId 
}) => {
  // State for UI elements
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    portfolios.find(p => p.is_default) || portfolios[0] || null
  );
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  
  // Get currency from store
  const { currency } = useCurrencyStore();

  // Filter transactions for the selected portfolio
  const portfolioTransactions = selectedPortfolio 
    ? transactions.filter(t => t.portfolio_id === selectedPortfolio.id)
    : [];

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

  // Mock market data for AddAsset if not provided
  const defaultMarketData = marketData || {
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
                            ? 'bg-[var(--accent-primary-10)] text-[var(--accent-primary)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        {portfolio.name}
                      </button>
                    ))}
                    <div className="border-t border-[var(--bg-hover)] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setShowCreatePortfolio(true);
                          setIsPortfolioMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create New
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add Asset button */}
            {selectedPortfolio && (
              <Button
                onClick={() => setShowAddAsset(true)}
                variant="subtle"
                size="sm"
                className="flex items-center gap-1.5 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Add Asset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Portfolio content */}
        <div className="border-t border-gray-800/50">
          {selectedPortfolio ? (
            <div className="p-4">
              {portfolioTransactions.length > 0 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--text-primary)] font-medium mb-2">
                    {selectedPortfolio.name}
                  </p>
                  <p className="text-[var(--text-secondary)] mb-4">
                    {portfolioTransactions.length} transaction{portfolioTransactions.length !== 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                    <div className="text-center">
                      <p className="text-xs text-[var(--text-secondary)]">Total Value</p>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">
                        {formatCurrency(selectedPortfolio.total_value, currency)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[var(--text-secondary)]">Total Cost</p>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">
                        {formatCurrency(selectedPortfolio.total_cost, currency)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[var(--text-secondary)]">P/L</p>
                      <p className={`text-lg font-semibold ${
                        selectedPortfolio.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {formatCurrency(selectedPortfolio.total_profit_loss, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--text-secondary)] mb-4">
                    Add your first asset to get started.
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
          marketData={defaultMarketData}
          portfolios={[{ id: selectedPortfolio.id, name: selectedPortfolio.name }]}
          selectedPortfolioId={selectedPortfolio.id}
          transactions={portfolioTransactions}
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