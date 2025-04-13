// components/TabNavigation.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PiggyBank,
  TrendingUp,
  Wallet,
  CreditCard,
  Building,
  FileText,
} from "lucide-react";

interface TabNavigationProps {
  currentTab: string | undefined;
}

export default function TabNavigation({ currentTab }: TabNavigationProps) {
  const pathname = usePathname();

  const tabs = [
    {
      id: "markets",
      label: "Markets",
      icon: <TrendingUp className="h-4 w-4 xs:h-5 xs:w-5" />,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: <FileText className="h-4 w-4 xs:h-5 xs:w-5" />,
    },
    {
      id: "portfolios",
      label: "Portfolios",
      icon: <Wallet className="h-4 w-4 xs:h-5 xs:w-5" />,
    },
    {
      id: "debt",
      label: "Debt",
      icon: <CreditCard className="h-4 w-4 xs:h-5 xs:w-5" />,
    },
    {
      id: "real-estate",
      label: "Real Estate",
      icon: <Building className="h-4 w-4 xs:h-5 xs:w-5" />,
    },
    {
      id: "budget",
      label: "Budget",
      icon: <PiggyBank className="h-4 w-4 xs:h-5 xs:w-5" />,
    },
  ];

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl shadow-md overflow-hidden max-w-[90%] mx-auto">
      <div className="flex flex-wrap lg:flex-nowrap overflow-x-auto border-b border-gray-700 scrollbar-hide">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`${pathname}?tab=${tab.id}`}
            className={`relative transition-colors whitespace-nowrap flex flex-col items-center justify-center lg:flex-row lg:items-center lg:gap-1 xl:gap-2 flex-1 min-w-[4rem] xs:min-w-0 py-2 px-1 xs:px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 xs:py-2 sm:py-2.5 md:py-3 text-xs xs:text-sm lg:text-base ${
              currentTab === tab.id
                ? "border-b-2 border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--bg-secondary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <div className="mb-1 lg:mb-0">{tab.icon}</div>
            <div className="relative">
              <span className="text-2xs xs:text-xs sm:text-sm lg:text-base">
                {tab.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}