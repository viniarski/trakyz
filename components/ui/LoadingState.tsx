// components/ui/LoadingState.tsx

interface LoadingStateProps {
    message?: string;
    className?: string;
  }
  
  export function LoadingState({ 
    message = "Loading...", 
    className = "p-8"
  }: LoadingStateProps) {
    return (
      <div className={`text-center text-[var(--text-secondary)] ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-[var(--accent-primary)] mx-auto mb-4"></div>
        {message}
      </div>
    );
  }