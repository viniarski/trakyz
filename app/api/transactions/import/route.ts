// app/api/transactions/import/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';

type TransactionType = 'BUY' | 'SELL';
type AssetCategory = 'CRYPTO' | 'STOCKS' | 'PRECIOUS_METALS' | 'CURRENCIES' | 'BONDS' | 'REIT' | 'COMMODITIES';

interface ParsedTransaction {
  type: TransactionType;
  category: AssetCategory;
  asset_type: string;
  quantity: number;
  price: number;
  date: string;
}

interface ValidationError {
  row: number;
  column: string;
  error: string;
  value: any;
}

interface ValidationResult {
  isValid: boolean;
  data: ParsedTransaction[] | null;
  errors: ValidationError[];
}

function validateData(data: Record<string, string | number | undefined>[]): ValidationResult {
  const errors: ValidationError[] = [];
  const validData: ParsedTransaction[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2; // Excel row numbers start at 1, plus header row

    // Check required fields
    if (!row.Type || !row.Category || !row.Asset_Type || !row.Quantity || !row.Price || !row.Date) {
      errors.push({
        row: rowNumber,
        column: 'Required Fields',
        error: 'Missing required fields (Type, Category, Asset_Type, Quantity, Price, Date)',
        value: JSON.stringify(row)
      });
      continue;
    }

    // Validate transaction type
    const type = String(row.Type).toUpperCase();
    if (type !== 'BUY' && type !== 'SELL') {
      errors.push({
        row: rowNumber,
        column: 'Type',
        error: 'Type must be BUY or SELL',
        value: row.Type
      });
      continue;
    }

    // Validate category
    const category = String(row.Category).toUpperCase();
    const validCategories = ['CRYPTO', 'STOCKS', 'PRECIOUS_METALS', 'CURRENCIES', 'BONDS', 'REIT', 'COMMODITIES'];
    if (!validCategories.includes(category)) {
      errors.push({
        row: rowNumber,
        column: 'Category',
        error: `Category must be one of: ${validCategories.join(', ')}`,
        value: row.Category
      });
      continue;
    }

    // Validate quantity
    const quantity = Number(row.Quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push({
        row: rowNumber,
        column: 'Quantity',
        error: 'Quantity must be a positive number',
        value: row.Quantity
      });
      continue;
    }

    // Validate price
    const price = Number(row.Price);
    if (isNaN(price) || price <= 0) {
      errors.push({
        row: rowNumber,
        column: 'Price',
        error: 'Price must be a positive number',
        value: row.Price
      });
      continue;
    }

    // Validate date
    const dateStr = String(row.Date);
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      errors.push({
        row: rowNumber,
        column: 'Date',
        error: 'Date must be a valid date format',
        value: row.Date
      });
      continue;
    }

    // If we get here, the row is valid
    validData.push({
      type: type as TransactionType,
      category: category as AssetCategory,
      asset_type: String(row.Asset_Type),
      quantity,
      price,
      date: date.toISOString().split('T')[0] // Format as YYYY-MM-DD
    });
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? validData : null,
    errors
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
        
        // Create workbook using ExcelJS
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        
        // Get the first worksheet
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          return NextResponse.json({ error: 'No worksheets found in workbook' }, { status: 400 });
        }

        // Convert worksheet to JSON format
        const jsonData: Record<string, string | number | undefined>[] = [];
        const headers: string[] = [];
        
        // Get headers from first row
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
          headers[colNumber - 1] = String(cell.value || '').trim();
        });

        // Process data rows (starting from row 2)
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row
          
          const rowData: Record<string, string | number | undefined> = {};
          let hasData = false;
          
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              let cellValue = cell.value;
              let processedValue: string | number | undefined;
              
              // Handle different cell value types and convert to our expected types
              if (cellValue !== null && cellValue !== undefined) {
                // Handle date values
                if (cell.type === ExcelJS.ValueType.Date) {
                  processedValue = cellValue instanceof Date ? cellValue.toISOString().split('T')[0] : String(cellValue);
                }
                // Handle formula results
                else if (typeof cellValue === 'object' && cellValue !== null && 'result' in cellValue) {
                  const formulaResult = (cellValue as any).result;
                  processedValue = formulaResult !== null && formulaResult !== undefined ? 
                    (typeof formulaResult === 'number' ? formulaResult : String(formulaResult).trim()) : 
                    undefined;
                }
                // Handle string values
                else if (typeof cellValue === 'string') {
                  processedValue = cellValue.trim();
                } 
                // Handle number values
                else if (typeof cellValue === 'number') {
                  processedValue = cellValue;
                } 
                // Handle other types by converting to string
                else {
                  processedValue = String(cellValue).trim();
                }
                
                // Only assign if we have a valid processed value
                if (processedValue !== undefined && processedValue !== '') {
                  rowData[header] = processedValue;
                  hasData = true;
                }
              }
            }
          });
          
          // Only add row if it has data
          if (hasData) {
            jsonData.push(rowData);
          }
        });

        importedData = jsonData;
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