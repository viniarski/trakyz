// components/Transactions/components/TransactionsHeader.tsx

'use client'

import { Filter, Plus, Trash2, Upload, Download, ChevronDown } from 'lucide-react'
import { CurrencyCode } from '@/types'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button';

// Define the valid button variant types
type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "subtle";

interface TransactionsHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  portfolios: Array<{ id: string, name: string }>;
  selectedPortfolio: string | null;
  setSelectedPortfolio: (id: string) => void;
  handleAddTransaction: () => void;
  handleDeleteAll: () => void;
  handleImport: (type: string) => void;
  handleExport: (type: string) => void;
  currency: CurrencyCode;
  transactions: any[];
}

export function TransactionsHeader({
  showFilters,
  setShowFilters,
  portfolios,
  selectedPortfolio,
  setSelectedPortfolio,
  handleAddTransaction,
  handleDeleteAll,
  handleImport,
  handleExport,
  currency,
  transactions
}: TransactionsHeaderProps) {
  // State for tracking which menu is open
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Refs for menu tracking
  const importMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        importMenuRef.current && 
        !importMenuRef.current.contains(event.target as Node) &&
        exportMenuRef.current && 
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle opening/closing import menu
  const toggleImportMenu = () => {
    setActiveMenu(activeMenu === 'import' ? null : 'import');
  };
  
  // Handle opening/closing export menu
  const toggleExportMenu = () => {
    setActiveMenu(activeMenu === 'export' ? null : 'export');
  };

  return (
    <div>
      {/* Header with buttons - same styling as Markets */}
      <div className="p-4 flex justify-between items-center flex-wrap gap-y-2">
        {/* Left side */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Transaction button */}
          <Button
            onClick={handleAddTransaction}
            variant="subtle"
            size="sm"
            className="flex items-center gap-1.5 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Add Transaction</span>
          </Button>
          
          {/* Portfolio selector */}
          {portfolios.length > 0 && (
            <select
              value={selectedPortfolio || ''}
              onChange={(e) => setSelectedPortfolio(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-md transition-colors font-medium bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none"
            >
              {portfolios.map(portfolio => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </option>
              ))}
            </select>
          )}
        </div>
        
        {/* Right side */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter button */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "subtle" : "ghost"}
            size="sm"
            className={`flex items-center gap-1.5 ${showFilters ? "hover:bg-[var(--accent-primary-20)]" : "text-[var(--text-secondary)]"}`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Filters</span>
          </Button>
          
          {/* Import button with dropdown */}
          <div className="relative" ref={importMenuRef}>
            <Button
              onClick={toggleImportMenu}
              variant={activeMenu === 'import' ? "subtle" : "ghost"}
              size="sm"
              className={`flex items-center gap-1.5 ${activeMenu === 'import' ? "hover:bg-[var(--accent-primary)]/20" : "text-[var(--text-secondary)]"}`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Import</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform hidden xs:inline-block ${activeMenu === 'import' ? 'rotate-180' : ''}`} />
            </Button>
            
            {/* Import dropdown menu */}
            {activeMenu === 'import' && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] rounded-md shadow-lg border border-[var(--bg-hover)] z-10">
                <div className="py-1">
                  <button
                    onClick={() => { handleImport('csv'); setActiveMenu(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    Import CSV
                  </button>
                  <button
                    onClick={() => { handleImport('xlsx'); setActiveMenu(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    Import Excel
                  </button>
                  <button
                    onClick={() => { handleImport('json'); setActiveMenu(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    Import JSON
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Export button with dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <Button
              onClick={toggleExportMenu}
              variant={activeMenu === 'export' ? "subtle" : "ghost"}
              size="sm"
              className={`flex items-center gap-1.5 ${activeMenu === 'export' ? "hover:bg-[var(--accent-primary)]/20" : "text-[var(--text-secondary)]"}`}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Export</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform hidden xs:inline-block ${activeMenu === 'export' ? 'rotate-180' : ''}`} />
            </Button>
            
            {/* Export dropdown menu */}
            {activeMenu === 'export' && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] rounded-md shadow-lg border border-[var(--bg-hover)] z-10">
                <div className="py-1">
                  <button
                    onClick={() => { handleExport('csv'); setActiveMenu(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => { handleExport('xlsx'); setActiveMenu(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    Export Excel
                  </button>
                  <button
                    onClick={() => { handleExport('json'); setActiveMenu(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => { handleExport('pdf'); setActiveMenu(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Delete All button */}
          <Button
            onClick={handleDeleteAll}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-red-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Delete All</span>
          </Button>
        </div>
      </div>
      
      {/* This is the key line that matches the Markets styling */}
      <div className="border-t border-gray-800/50"></div>
    </div>
  );
}