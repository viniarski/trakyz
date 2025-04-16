// components/market-rates/loading-state.tsx

export function LoadingState() {
    return (
      <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)] py-8">
        <div className="animate-spin h-4 w-4 border-2 border-[var(--accent-primary)] rounded-full border-t-transparent"></div>
        Loading market data...
      </div>
    )
  }