// components/Transactions/modals/Filters.tsx

interface FiltersProps {
  filters: {
    startDate: string;
    endDate: string;
    type: string;
    category: string;
    assetType: string;
  };
  setFilters: (filters: {
    startDate: string;
    endDate: string;
    type: string;
    category: string;
    assetType: string;
  }) => void;
  showFilters: boolean;
}

const Filters: React.FC<FiltersProps> = ({ filters, setFilters, showFilters }) => {
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      type: "ALL",
      category: "",
      assetType: "",
    });
  };

  const baseButtonClass =
    "text-sm px-3 py-1.5 rounded-md transition-colors font-medium";
  const inactiveButtonClass =
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]";

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
      {showFilters && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={clearFilters}
              className={`${baseButtonClass} ${inactiveButtonClass} text-red-500 hover:text-red-500 hover:bg-red-500/10`}
            >
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] rounded-md border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] rounded-md border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Transaction Type
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] rounded-md border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              >
                <option value="ALL">All</option>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="e.g., Crypto, Stocks"
                className="w-full px-3 py-2 bg-[var(--bg-primary)] rounded-md border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Asset Type
              </label>
              <input
                type="text"
                name="assetType"
                value={filters.assetType}
                onChange={handleFilterChange}
                placeholder="e.g., BTC, AAPL"
                className="w-full px-3 py-2 bg-[var(--bg-primary)] rounded-md border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Filters;