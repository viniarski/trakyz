// app/api/transactions/import/route.ts
  
  import { NextResponse } from 'next/server';
  import { createClient } from '@/lib/supabase/server';
  import * as Papa from 'papaparse';
  import * as XLSX from 'xlsx';
  
  interface ValidationError {
    row: number;
    column: string;
    value: string;
    error: string;
  }
  
  interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    data: ImportedTransaction[] | null;
  }
  
  interface ImportedTransaction {
    type: 'BUY' | 'SELL';
    category: string;
    asset_type: string;
    quantity: number;
    price: number;
    date: string;
  }
  
  interface RawTransaction {
    type?: string;
    category?: string;
    asset_type?: string;
    quantity?: string | number;
    price?: string | number;
    date?: string;
    [key: string]: string | number | undefined;
  }
  
  const VALID_CATEGORIES = [
    'Crypto',
    'Precious Metals',
    'Cash',
    'Stocks & Indexes',
    'Real Estate',
    'REIT',
    'Bonds',
    'Commodities'
  ];
  
  function normalizeFieldNames(data: Record<string, string | number | undefined>): RawTransaction {
    const normalized: RawTransaction = {};
    
    Object.entries(data).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('type') && !lowerKey.includes('asset')) normalized.type = String(value);
      else if (lowerKey.includes('asset')) normalized.asset_type = String(value);
      else if (lowerKey === 'category') normalized.category = String(value);
      else if (lowerKey === 'quantity' || lowerKey === 'amount') normalized.quantity = value;
      else if (lowerKey === 'price') normalized.price = value;
      else if (lowerKey === 'date') normalized.date = String(value);
    });
  
    return normalized;
  }
  
  function parseDateString(dateStr: string): Date | null {
    if (!dateStr) return null;
  
    if (dateStr.includes('-')) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) return date;
    }
  
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day) {
          return date;
        }
      }
    }
  
    return null;
  }
  
  function validateTransaction(rawData: Record<string, string | number | undefined>, rowIndex: number): ValidationError[] {
    const errors: ValidationError[] = [];
    const data = normalizeFieldNames(rawData);
  
    if (!data.type || !['BUY', 'SELL'].includes(data.type.toUpperCase())) {
      errors.push({ row: rowIndex, column: 'Type', value: data.type || '', error: 'Type must be either BUY or SELL' });
    }
  
    if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
      errors.push({ row: rowIndex, column: 'Category', value: data.category || '', error: 'Invalid category' });
    }
  
    if (!data.asset_type) {
      errors.push({ row: rowIndex, column: 'Asset Type', value: data.asset_type || '', error: 'Asset type is required' });
    }
  
    const quantity = Number(data.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push({ row: rowIndex, column: 'Quantity', value: String(data.quantity) || '', error: 'Quantity must be a positive number' });
    }
  
    const price = Number(data.price);
    if (isNaN(price) || price <= 0) {
      errors.push({ row: rowIndex, column: 'Price', value: String(data.price) || '', error: 'Price must be a positive number' });
    }
  
    if (!data.date || !parseDateString(data.date)) {
      errors.push({ row: rowIndex, column: 'Date', value: data.date || '', error: 'Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD' });
    }
  
    return errors;
  }
  
  function validateData(data: Record<string, string | number | undefined>[]): ValidationResult {
    const errors: ValidationError[] = [];
    const validData: ImportedTransaction[] = [];
  
    data.forEach((row, index) => {
      const rowErrors = validateTransaction(row, index + 2);
      if (rowErrors.length === 0) {
        const normalizedRow = normalizeFieldNames(row);
        const parsedDate = parseDateString(normalizedRow.date || '');
        
        if (parsedDate && normalizedRow.type && normalizedRow.category) {
          validData.push({
            type: normalizedRow.type.toUpperCase() as 'BUY' | 'SELL',
            category: normalizedRow.category,
            asset_type: normalizedRow.asset_type || '',
            quantity: Number(normalizedRow.quantity),
            price: Number(normalizedRow.price),
            date: parsedDate.toISOString().split('T')[0]
          });
        }
      } else {
        errors.push(...rowErrors);
      }
    });
  
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? validData : null
    };
  }
  
  export async function POST(request: Request) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const type = formData.get('type') as string;
      const portfolioId = formData.get('portfolioId') as string;
  
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
  
      // Fix: Use a separate variable that can be modified
      let selectedPortfolioId = portfolioId;
  
      if (!selectedPortfolioId) {
        // Try to get default portfolio
        const { data: portfolios, error: portfolioError } = await supabase
          .from('portfolios')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .limit(1);
          
        if (portfolioError || !portfolios || portfolios.length === 0) {
          return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
        }
        
        selectedPortfolioId = portfolios[0].id;
      }
  
      // Validate portfolio belongs to user
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id')
        .eq('id', selectedPortfolioId)
        .eq('user_id', user.id)
        .single();
  
      if (portfolioError || !portfolio) {
        return NextResponse.json({ error: 'Invalid portfolio' }, { status: 400 });
      }
  
      let importedData: Record<string, string | number | undefined>[] = [];
  
      if (type === 'csv') {
        try {
          const text = await file.text();
          const result = Papa.parse(text, { 
            header: true, 
            skipEmptyLines: true, 
            transform: (value) => value.trim() 
          });
  
          if (result.errors && result.errors.length > 0) {
            return NextResponse.json({ error: result.errors[0].message }, { status: 400 });
          }
  
          importedData = result.data as Record<string, string | number | undefined>[];
        } catch (error) {
          return NextResponse.json({ 
            error: 'Failed to parse CSV file',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 400 });
        }
      } 
      else if (type === 'xlsx') {
        try {
          const buffer = await file.arrayBuffer();
          
          // Try to use the most compatible approach
          let workbook;
          try {
            workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
          } catch (e) {
            // Fallback method
            workbook = XLSX.read(buffer, { type: 'buffer' });
          }
  
          const firstSheetName = workbook.SheetNames?.[0];
          if (!firstSheetName) {
            return NextResponse.json({ error: 'No sheets found in workbook' }, { status: 400 });
          }
          
          const worksheet = workbook.Sheets[firstSheetName];
          if (!worksheet) {
            return NextResponse.json({ error: 'Empty worksheet' }, { status: 400 });
          }
  
          importedData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        } catch (error) {
          console.error('Excel parsing error:', error);
          return NextResponse.json({ 
            error: 'Failed to parse Excel file',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 400 });
        }
      }
      else if (type === 'json') {
        try {
          const text = await file.text();
          const jsonData = JSON.parse(text);
          if (!Array.isArray(jsonData)) {
            return NextResponse.json({ 
              error: 'Invalid JSON format. Expected an array of transactions.' 
            }, { status: 400 });
          }
          importedData = jsonData as Record<string, string | number | undefined>[];
        } catch (error) {
          return NextResponse.json({ 
            error: 'Invalid JSON format',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 400 });
        }
      }
      else {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
      }
  
      if (importedData.length === 0) {
        return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
      }
  
      const validation = validateData(importedData);
      if (!validation.isValid || !validation.data) {
        const firstError = validation.errors[0];
        return NextResponse.json({ 
          error: `Row ${firstError.row}: ${firstError.error} (Column: ${firstError.column}, Value: "${firstError.value}")` 
        }, { status: 400 });
      }
  
      // Insert transactions
      const insertedTransactions = [];
      for (const transaction of validation.data) {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            portfolio_id: selectedPortfolioId,
            transaction_type: transaction.type,
            category: transaction.category,
            asset_type: transaction.asset_type,
            quantity: transaction.quantity,
            price: transaction.price,
            date: transaction.date
          })
          .select();
          
        if (error) {
          console.error('Error inserting transaction:', error);
        } else if (data) {
          insertedTransactions.push(data[0]);
        }
      }
  
      return NextResponse.json({ 
        success: true,
        message: `Successfully imported ${insertedTransactions.length} transactions`
      });
    } catch (error) {
      console.error('Import error:', error);
      return NextResponse.json(
        { error: 'Failed to import transactions', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }