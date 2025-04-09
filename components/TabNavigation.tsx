"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabNavigationProps {
  currentTab: string | undefined;
}

export default function TabNavigation({ currentTab }: TabNavigationProps) {
  const pathname = usePathname();

  const tabs = [
    { id: "budget", label: "Budget" },
    { id: "markets", label: "Markets" },
    { id: "debt", label: "Debt" },
    { id: "real-estate", label: "Real Estate" },
    { id: "portfolios", label: "Portfolios" },
    { id: "transactions", label: "Transactions" },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
        {tabs.map((tab) => (
          <li key={tab.id} className="mr-2">
            <Link
              href={`${pathname}?tab=${tab.id}`}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                currentTab === tab.id
                  ? "text-blue-600 border-blue-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
