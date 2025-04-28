// components/Transactions/components/ExportModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { saveAs } from 'file-saver'
import { X } from 'lucide-react'
import { Transaction, CurrencyCode, Currency, Crypto } from '@/types'
import { convertCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  exportFormat: 'csv' | 'xlsx' | 'json' | 'pdf' | null
  onNotification: (type: 'success' | 'error', message: string) => void
  selectedCurrency: CurrencyCode
  currencyRates: { currencies: Currency[] | null; crypto: Crypto[] | null }
  initialPortfolioId?: string
}

interface TransactionExportData {
  Date: string
  Type: string
  Category: string
  Asset_Type: string
  Quantity: number
  Price: number
  Total: number
  GainLoss?: number
}

export function ExportModal({
  isOpen,
  onClose,
  exportFormat,
  onNotification,
  selectedCurrency,
  currencyRates,
  initialPortfolioId
}: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [minDate, setMinDate] = useState<string>('')
  const [maxDate, setMaxDate] = useState<string>('')
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(initialPortfolioId || null)
  const [availablePortfolios, setAvailablePortfolios] = useState<{ id: string, name: string }[]>([])
  
  const supabase = createClient()

  // Fetch available portfolios and date range when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPortfolios()
    }
  }, [isOpen])

  // Format transaction data to export format
  const formatTransactionData = (transaction: Transaction): TransactionExportData => ({
    Date: transaction.date.split('T')[0],
    Type: transaction.transaction_type,
    Category: transaction.category,
    Asset_Type: transaction.asset_type,
    Quantity: transaction.quantity,
    Price: convertCurrency(transaction.price, 'USD', selectedCurrency, currencyRates),
    Total: convertCurrency(transaction.quantity * transaction.price, 'USD', selectedCurrency, currencyRates),
  })

  // Fetch available portfolios for filtering
  const fetchPortfolios = async () => {
    try {
      const { data: portfolios, error } = await supabase
        .from('portfolios')
        .select('id, name, is_default')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (portfolios && portfolios.length > 0) {
        setAvailablePortfolios(portfolios);
        
        // Set the initial portfolio or default if none was provided
        if (!selectedPortfolio && portfolios.length > 0) {
          const defaultPortfolio = portfolios.find(p => p.is_default) || portfolios[0];
          setSelectedPortfolio(defaultPortfolio.id);
        }
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      onNotification('error', 'Failed to fetch portfolios');
    }
  }

  // Triggered when portfolio selection changes
  useEffect(() => {
    if (selectedPortfolio) {
      fetchDateRange();
    }
  }, [selectedPortfolio]);

  // Fetch the min and max dates for the date pickers
  const fetchDateRange = async () => {
    if (!selectedPortfolio) return;
    
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('date')
        .eq('portfolio_id', selectedPortfolio)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      if (transactions && transactions.length > 0) {
        // Get earliest and latest dates
        const sortedDates = [...transactions].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        const min = new Date(sortedDates[0].date).toISOString().split('T')[0];
        const max = new Date(sortedDates[sortedDates.length - 1].date).toISOString().split('T')[0];
        
        setMinDate(min);
        setMaxDate(max);
        
        // Default to all dates
        setFromDate(min);
        setToDate(max);
      } else {
        setMinDate('');
        setMaxDate('');
        setFromDate('');
        setToDate('');
      }
    } catch (error) {
      console.error('Error fetching transaction date range:', error);
      onNotification('error', 'Failed to fetch date range');
    }
  }

  // Handle the export action
  const handleExport = async () => {
    if (!exportFormat || !selectedPortfolio) {
      onNotification('error', 'Please select a portfolio and date range');
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Fetch transactions with filters
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', selectedPortfolio);
      
      // Handle date filtering
      if (fromDate) {
        // Make sure we're using the correct date format
        query = query.gte('date', fromDate);
      }
      
      if (toDate) {
        // Add one day to include the end date
        const nextDay = new Date(toDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const endDate = nextDay.toISOString().split('T')[0];
        query = query.lt('date', endDate);
      }
      
      const { data: transactions, error } = await query;
      
      // Debug logging
      console.log('Portfolio ID:', selectedPortfolio);
      console.log('Date range:', fromDate, 'to', toDate);
      console.log('Transactions found:', transactions?.length || 0);
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      if (!transactions || transactions.length === 0) {
        onNotification('error', 'No transactions found for the selected criteria');
        return;
      }
      
      // Format the data for export
      const exportData = transactions.map(tx => ({
        Date: new Date(tx.date).toISOString().split('T')[0],
        Type: tx.transaction_type,
        Category: tx.category,
        Asset_Type: tx.asset_type,
        Quantity: Number(tx.quantity),
        Price: Number(tx.price),
        Total: Number(tx.quantity) * Number(tx.price)
      }));
      
      console.log('Formatted export data:', exportData.length);
      
      // Get the portfolio name for the filename
      const portfolioName = availablePortfolios.find(p => p.id === selectedPortfolio)?.name || 'portfolio';
      const safeName = portfolioName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const dateRange = fromDate === minDate && toDate === maxDate 
        ? 'all-time'
        : `${fromDate}-to-${toDate}`;
      
      // Export based on the selected format
      switch (exportFormat) {
        case 'csv':
          exportCSV(exportData, `${safeName}-transactions-${dateRange}`);
          break;
        case 'xlsx':
          await importExcelJS().then(ExcelJS => 
            exportXLSX(ExcelJS, exportData, `${safeName}-transactions-${dateRange}`)
          );
          break;
        case 'json':
          exportJSON(exportData, `${safeName}-transactions-${dateRange}`);
          break;
        case 'pdf':
          await importPDFLib().then(pdfLib => 
            exportPDF(pdfLib, exportData, `${safeName}-transactions-${dateRange}`, portfolioName)
          );
          break;
      }
      
      onNotification('success', `Transactions exported successfully as ${exportFormat.toUpperCase()}`);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      onNotification('error', error instanceof Error ? error.message : 'Failed to export transactions');
    } finally {
      setIsExporting(false);
    }
  }
  
  // Dynamically import Excel.js when needed
  const importExcelJS = async () => {
    // We're still using ExcelJS for export since it has better formatting options
    const module = await import('exceljs');
    return module.default;
  }
  
  // Dynamically import PDF-Lib when needed
  const importPDFLib = async () => {
    const module = await import('pdf-lib');
    return module;
  }
  
  // Export as CSV
  const exportCSV = (data: TransactionExportData[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${filename}.csv`);
  }
  
  // Export as JSON
  const exportJSON = (data: TransactionExportData[], filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `${filename}.json`);
  }
  
  // Improved XLSX export with better error handling
  const exportXLSX = async (ExcelJS: any, data: TransactionExportData[], filename: string) => {
    try {
      console.log('Creating XLSX with', data.length, 'rows');
      
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Trakyz';
      const worksheet = workbook.addWorksheet('Transactions');
      
      // Add headers
      const headers = Object.keys(data[0]).map(header => ({ 
        header, 
        key: header.toLowerCase(),
        width: 15 // Make columns wider
      }));
      worksheet.columns = headers;
      
      // Add rows - using explicit values to avoid issues
      data.forEach((transaction, index) => {
        worksheet.addRow({
          date: transaction.Date,
          type: transaction.Type,
          category: transaction.Category,
          asset_type: transaction.Asset_Type,
          quantity: transaction.Quantity,
          price: transaction.Price,
          total: transaction.Total
        });
      });
      
      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      
      // Generate the file
      console.log('Generating XLSX buffer');
      const buffer = await workbook.xlsx.writeBuffer();
      console.log('XLSX buffer created, size:', buffer.byteLength);
      
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${filename}.xlsx`);
      console.log('XLSX file saved as', `${filename}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('XLSX export error:', error);
      throw error;
    }
  }
  
  // Export as PDF
  const exportPDF = async (pdfLib: any, data: TransactionExportData[], filename: string, portfolioName: string) => {
    const { PDFDocument, rgb, StandardFonts } = pdfLib;
    
    // Create the PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const margin = 50;
    let yPosition = height - margin;
    
    // Add fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add title and metadata
    page.drawText(`Transactions - ${portfolioName}`, {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont
    });
    yPosition -= 20;
    
    page.drawText(`Date Range: ${fromDate} to ${toDate}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font
    });
    yPosition -= 15;
    
    page.drawText(`Currency: ${selectedCurrency}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font
    });
    yPosition -= 15;
    
    page.drawText(`Total Transactions: ${data.length}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font
    });
    yPosition -= 30;
    
    // Add table headers
    const columnWidths = [80, 40, 80, 80, 60, 80, 80];
    const headers = ['Date', 'Type', 'Category', 'Asset', 'Quantity', 'Price', 'Total'];
    let xPosition = margin;
    
    headers.forEach((header, i) => {
      page.drawText(header, {
        x: xPosition,
        y: yPosition,
        size: 10,
        font: boldFont
      });
      xPosition += columnWidths[i];
    });
    yPosition -= 15;
    
    // Draw a line below headers
    page.drawLine({
      start: { x: margin, y: yPosition + 5 },
      end: { x: width - margin, y: yPosition + 5 },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5)
    });
    yPosition -= 10;
    
    // Add rows (first page)
    const rowHeight = 15;
    const maxRowsPerPage = Math.floor((yPosition - margin) / rowHeight);
    
    // Process data in chunks for multiple pages
    for (let i = 0; i < data.length; i++) {
      // Create a new page if needed
      if (i > 0 && i % maxRowsPerPage === 0) {
        const newPage = pdfDoc.addPage();
        yPosition = height - margin;
        
        // Repeat headers on new page
        xPosition = margin;
        headers.forEach((header, j) => {
          newPage.drawText(header, {
            x: xPosition,
            y: yPosition,
            size: 10,
            font: boldFont
          });
          xPosition += columnWidths[j];
        });
        yPosition -= 15;
        
        // Draw a line below headers
        newPage.drawLine({
          start: { x: margin, y: yPosition + 5 },
          end: { x: width - margin, y: yPosition + 5 },
          thickness: 1,
          color: rgb(0.5, 0.5, 0.5)
        });
        yPosition -= 10;
      }
      
      // Get current page
      const currentPage = pdfDoc.getPages()[Math.floor(i / maxRowsPerPage)];
      const rowY = yPosition - (i % maxRowsPerPage) * rowHeight;
      
      // Draw row data
      const transaction = data[i];
      xPosition = margin;
      
      // Date
      currentPage.drawText(transaction.Date, {
        x: xPosition,
        y: rowY,
        size: 8,
        font
      });
      xPosition += columnWidths[0];
      
      // Type
      currentPage.drawText(transaction.Type, {
        x: xPosition,
        y: rowY,
        size: 8,
        font
      });
      xPosition += columnWidths[1];
      
      // Category
      currentPage.drawText(transaction.Category, {
        x: xPosition,
        y: rowY,
        size: 8,
        font
      });
      xPosition += columnWidths[2];
      
      // Asset
      currentPage.drawText(transaction.Asset_Type, {
        x: xPosition,
        y: rowY,
        size: 8,
        font
      });
      xPosition += columnWidths[3];
      
      // Quantity
      currentPage.drawText(transaction.Quantity.toString(), {
        x: xPosition,
        y: rowY,
        size: 8,
        font
      });
      xPosition += columnWidths[4];
      
      // Price
      currentPage.drawText(`${selectedCurrency} ${transaction.Price.toFixed(2)}`, {
        x: xPosition,
        y: rowY,
        size: 8,
        font
      });
      xPosition += columnWidths[5];
      
      // Total
      currentPage.drawText(`${selectedCurrency} ${transaction.Total.toFixed(2)}`, {
        x: xPosition,
        y: rowY,
        size: 8,
        font
      });
    }
    
    // Generate the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, `${filename}.pdf`);
  }

  // Set date range to all transactions
  const handleAllTransactions = () => {
    if (minDate && maxDate) {
      setFromDate(minDate);
      setToDate(maxDate);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Export Transactions</h2>
          <button 
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Portfolio selector */}
          {availablePortfolios.length > 0 && (
            <div>
              <label className="block text-[var(--text-secondary)] mb-2">Portfolio:</label>
              <select
                value={selectedPortfolio || ''}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                className="w-full p-2 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-md border border-[var(--bg-hover)]"
              >
                {availablePortfolios.map(portfolio => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
{/* Date range */}
<div>
            <label className="block text-[var(--text-secondary)] mb-2">From Date:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              min={minDate || undefined}
              max={toDate || maxDate || undefined}
              className="w-full p-2 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-md border border-[var(--bg-hover)]"
            />
          </div>
          
          <div>
            <label className="block text-[var(--text-secondary)] mb-2">To Date:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate || minDate || undefined}
              max={maxDate || undefined}
              className="w-full p-2 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-md border border-[var(--bg-hover)]"
            />
          </div>
          
          {/* All transactions button */}
          <button
            onClick={handleAllTransactions}
            className="w-full px-4 py-2 bg-[var(--accent-primary-10)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary-20)] rounded-md transition-colors"
            disabled={!minDate || !maxDate}
          >
            All Transactions
          </button>
          
          {/* Selected format info */}
          <div className="bg-[var(--bg-hover)]/30 p-3 rounded-md">
            <p className="text-sm text-[var(--text-secondary)]">
              Selected format: <span className="text-[var(--text-primary)]">{exportFormat?.toUpperCase() || 'None'}</span>
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {exportFormat === 'csv' && 'CSV format is ideal for importing into spreadsheet software.'}
              {exportFormat === 'xlsx' && 'Excel format preserves formatting and includes multiple sheets.'}
              {exportFormat === 'json' && 'JSON format is ideal for developers or data processing.'}
              {exportFormat === 'pdf' && 'PDF format creates a printable report with all transaction details.'}
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !fromDate || !toDate || !selectedPortfolio}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}