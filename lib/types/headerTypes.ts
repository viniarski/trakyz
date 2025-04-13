// lib/types/headerTypes.ts

export interface HeaderProps {
    userEmail?: string | null;
    userRole?: string | null;
    isSubscribed?: boolean;
  }
  
  export interface Currency {
    code: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
  }
  
  export interface UserMenuProps {
    userEmail?: string | null;
    userRole?: string | null;
  }
  
  export interface MobileMenuProps {
    userEmail?: string | null;
    userRole?: string | null;
    onClose: () => void;
    selectedCurrency: string;
    setSelectedCurrency: (currency: string) => void;
  }
  
  export interface CurrencySwitcherProps {
    selectedCurrency: string;
    setSelectedCurrency: (currency: string) => void;
    isMobile?: boolean;
    onSelectCallback?: () => void;
  }
  
  export interface BalanceToggleProps {
    hideBalances: boolean;
    toggleBalances: () => void;
  }
  
  export interface NotificationsButtonProps {
    // Add any props needed for notifications
  }