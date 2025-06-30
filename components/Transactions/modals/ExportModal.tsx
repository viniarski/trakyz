// components/Transactions/modals/ExportModal.tsx

import { useState } from 'react';
import { X, Download, FileText, Grid3x3, FileJson, FileImage } from 'lucide-react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  fileType: 'csv' | 'xlsx' | 'json' | 'pdf' | null;
  onSuccess: () => void;
  onError: (message: string) => void;
}

interface TransactionExportData {
  Date: string;
  Type: string;
  Category: string;
  Asset_Type: string;
  Quantity: number;
  Price: string;
  Total: string;
}

export function ExportModal({
  isOpen,
  onClose,
  transactions,
  fileType,
  onSuccess,
  onError
}: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !fileType) return null;

  // Prepare data for export
  const prepareData = (): TransactionExportData[] => {
    return transactions.map(transaction => ({
      Date: new Date(transaction.date).toLocaleDateString(),
      Type: transaction.transaction_type,
      Category: transaction.category,
      Asset_Type: transaction.asset_type,
      Quantity: transaction.quantity,
      Price: formatCurrency(transaction.price, 'USD'),
      Total: formatCurrency(transaction.quantity * transaction.price, 'USD')
    }));
  };

  // Export as CSV
  const exportCSV = (data: TransactionExportData[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export as JSON
  const exportJSON = (data: TransactionExportData[], filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export as XLSX using ExcelJS
  const exportXLSX = async (data: TransactionExportData[], filename: string) => {
    try {
      // Dynamic import of ExcelJS
      const ExcelJS = await import('exceljs');
      
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Trakyz';
      workbook.created = new Date();
      
      const worksheet = workbook.addWorksheet('Transactions');
      
      // Define columns
      worksheet.columns = [
        { header: 'Date', key: 'Date', width: 12 },
        { header: 'Type', key: 'Type', width: 8 },
        { header: 'Category', key: 'Category', width: 15 },
        { header: 'Asset Type', key: 'Asset_Type', width: 12 },
        { header: 'Quantity', key: 'Quantity', width: 12 },
        { header: 'Price', key: 'Price', width: 12 },
        { header: 'Total', key: 'Total', width: 12 }
      ];
      
      // Add data rows
      data.forEach(row => {
        worksheet.addRow(row);
      });
      
      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('XLSX export error:', error);
      throw new Error('Failed to export as Excel file');
    }
  };

  // Export as PDF - Simple HTML to PDF approach (no external dependencies)
  const exportPDF = async (data: TransactionExportData[], filename: string) => {
    try {
      // Create a simple HTML table for printing
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Transactions Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; margin-bottom: 10px; }
            .date { color: #666; font-size: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4285f4; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .number { text-align: right; }
          </style>
        </head>
        <body>
          <h1>Transactions Report</h1>
          <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Asset Type</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  <td>${row.Date}</td>
                  <td>${row.Type}</td>
                  <td>${row.Category}</td>
                  <td>${row.Asset_Type}</td>
                  <td class="number">${row.Quantity}</td>
                  <td class="number">${row.Price}</td>
                  <td class="number">${row.Total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Auto-trigger print dialog
        setTimeout(() => {
          printWindow.print();
        }, 250);
      } else {
        throw new Error('Unable to open print window');
      }
      
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('Failed to export as PDF file');
    }
  };

  const handleExport = async () => {
    if (transactions.length === 0) {
      onError('No transactions to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const data = prepareData();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `transactions_${timestamp}`;

      switch (fileType) {
        case 'csv':
          exportCSV(data, filename);
          break;
        case 'xlsx':
          await exportXLSX(data, filename);
          break;
        case 'json':
          exportJSON(data, filename);
          break;
        case 'pdf':
          await exportPDF(data, filename);
          break;
        default:
          throw new Error('Unsupported file type');
      }

      onSuccess();
    } catch (error) {
      console.error('Export error:', error);
      onError(error instanceof Error ? error.message : 'Failed to export file');
    } finally {
      setIsExporting(false);
    }
  };

  const getIcon = () => {
    switch (fileType) {
      case 'csv':
        return <FileText className="h-8 w-8 text-green-500" />;
      case 'xlsx':
        return <Grid3x3 className="h-8 w-8 text-green-600" />;
      case 'json':
        return <FileJson className="h-8 w-8 text-blue-500" />;
      case 'pdf':
        return <FileImage className="h-8 w-8 text-red-500" />;
      default:
        return <Download className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Export as {fileType?.toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            Export {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} as {fileType?.toUpperCase()} file.
          </p>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}