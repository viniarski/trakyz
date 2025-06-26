// app/api/transactions/import/route.ts

import { NextRequest, NextResponse } from 'next/server';
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
  notes?: string;
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
  totalRows: number;
  validRows: number;
}

// Enhanced validation function with comprehensive error checking
function validateData(data: Record<string, any>[]): ValidationResult {
  const errors: ValidationError[] = [];
  const validData: ParsedTransaction[] = [];
  const validCategories: AssetCategory[] = ['CRYPTO', 'STOCKS', 'PRECIOUS_METALS', 'CURRENCIES', 'BONDS', 'REIT', 'COMMODITIES'];
  const validTypes: TransactionType[] = ['BUY', 'SELL'];

  console.log(`Validating ${data.length} rows of transaction data`);

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2; // Excel row numbers start at 1, plus header row
    let hasErrors = false;

    // Skip completely empty rows
    if (!row || Object.values(row).every(val => val === null || val === undefined || val === '')) {
      continue;
    }

    // Helper function to add error
    const addError = (column: string, error: string, value: any) => {
      errors.push({ row: rowNumber, column, error, value });
      hasErrors = true;
    };

    // Validate required fields
    const requiredFields = ['Type', 'Category', 'Asset_Type', 'Quantity', 'Price', 'Date'];
    const missingFields = requiredFields.filter(field => 
      !row[field] && row[field] !== 0 // Allow 0 values but not null/undefined/empty
    );

    if (missingFields.length > 0) {
      addError('Required Fields', `Missing required fields: ${missingFields.join(', ')}`, JSON.stringify(row));
      continue; // Skip this row entirely if missing required fields
    }

    // Validate transaction type
    const type = String(row.Type).trim().toUpperCase();
    if (!validTypes.includes(type as TransactionType)) {
      addError('Type', `Type must be one of: ${validTypes.join(', ')}`, row.Type);
    }

    // Validate category
    const category = String(row.Category).trim().toUpperCase().replace(/\s+/g, '_');
    if (!validCategories.includes(category as AssetCategory)) {
      addError('Category', `Category must be one of: ${validCategories.join(', ')}`, row.Category);
    }

    // Validate asset type (should not be empty)
    const assetType = String(row.Asset_Type || '').trim();
    if (!assetType) {
      addError('Asset_Type', 'Asset type cannot be empty', row.Asset_Type);
    }

    // Validate quantity
    const quantityStr = String(row.Quantity).trim();
    const quantity = parseFloat(quantityStr);
    if (isNaN(quantity) || quantity <= 0) {
      addError('Quantity', 'Quantity must be a positive number', row.Quantity);
    }

    // Validate price
    const priceStr = String(row.Price).trim();
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      addError('Price', 'Price must be a positive number', row.Price);
    }

    // Validate date with multiple format support
    const dateStr = String(row.Date).trim();
    let date: Date;
    
    try {
      // Try parsing the date - support multiple formats
      if (dateStr.includes('/')) {
        // Handle MM/DD/YYYY or DD/MM/YYYY formats
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          // Assume MM/DD/YYYY for now, but could be enhanced with locale detection
          date = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
        } else {
          throw new Error('Invalid date format');
        }
      } else if (dateStr.includes('-')) {
        // Handle YYYY-MM-DD format
        date = new Date(dateStr);
      } else {
        // Handle Excel serial date numbers
        const excelDate = parseFloat(dateStr);
        if (!isNaN(excelDate) && excelDate > 0) {
          // Excel date serial number (days since 1900-01-01, with leap year bug)
          date = new Date((excelDate - 25569) * 86400 * 1000);
        } else {
          throw new Error('Invalid date format');
        }
      }

      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      // Check if date is reasonable (not in far future or past)
      const now = new Date();
      const yearAgo = new Date(now.getFullYear() - 50, 0, 1);
      const yearFromNow = new Date(now.getFullYear() + 1, 11, 31);
      
      if (date < yearAgo || date > yearFromNow) {
        addError('Date', 'Date must be within reasonable range (last 50 years to next year)', row.Date);
      }
    } catch (error) {
      addError('Date', 'Date must be a valid date format (YYYY-MM-DD, MM/DD/YYYY, or Excel date number)', row.Date);
    }

    // If no errors for this row, add to valid data
    if (!hasErrors) {
      validData.push({
        type: type as TransactionType,
        category: category as AssetCategory,
        asset_type: assetType,
        quantity,
        price,
        date: date!.toISOString().split('T')[0], // Format as YYYY-MM-DD
        notes: row.Notes ? String(row.Notes).trim() : undefined
      });
    }
  }

  return {
    isValid: errors.length === 0,
    data: validData.length > 0 ? validData : null,
    errors,
    totalRows: data.length,
    validRows: validData.length
  };
}

// Enhanced CSV parsing with better error handling
async function parseCSV(fileContent: string): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(fileContent, {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
      dynamicTyping: false, // Keep as strings for better validation control
      complete: (results) => {
        if (results.errors.length > 0) {
          const errorMessages = results.errors.map(err => `Row ${err.row}: ${err.message}`);
          reject(new Error(`CSV parsing errors: ${errorMessages.join('; ')}`));
          return;
        }
        
        // Clean up headers - remove extra spaces and normalize
        const cleanedData = results.data.map((row: Record<string, any>) => {
          const cleanRow: Record<string, any> = {};
          Object.keys(row).forEach(key => {
            const cleanKey = key.trim().replace(/\s+/g, '_');
            cleanRow[cleanKey] = row[key];
          });
          return cleanRow;
        });
        
        resolve(cleanedData);
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
}

// Enhanced Excel parsing with ExcelJS for better security
async function parseExcel(fileBuffer: ArrayBuffer): Promise<Record<string, any>[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    
    if (workbook.worksheets.length === 0) {
      throw new Error('Excel file contains no worksheets');
    }
    
    // Use the first worksheet
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) {
      throw new Error('Could not read worksheet data');
    }
    
    const data: Record<string, any>[] = [];
    let headers: string[] = [];
    
    // Process each row
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // First row contains headers
        headers = row.values as string[];
        // Remove the first element (ExcelJS adds undefined at index 0)
        headers = headers.slice(1).map(header => 
          String(header || '').trim().replace(/\s+/g, '_')
        );
        
        if (headers.length === 0) {
          throw new Error('No headers found in Excel file');
        }
      } else {
        // Data rows
        const rowValues = row.values as any[];
        // Remove the first element (ExcelJS adds undefined at index 0)
        const values = rowValues.slice(1);
        
        const rowData: Record<string, any> = {};
        let hasData = false;
        
        headers.forEach((header, index) => {
          let value = values[index];
          
          // Handle different cell types
          if (value !== null && value !== undefined) {
            // Handle date cells
            if (value instanceof Date) {
              value = value.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
            }
            // Handle rich text (extract text value)
            else if (typeof value === 'object' && value.richText) {
              value = value.richText.map((rt: any) => rt.text).join('');
            }
            // Handle hyperlinks
            else if (typeof value === 'object' && value.hyperlink) {
              value = value.text || value.hyperlink;
            }
            // Convert everything else to string and trim
            else {
              value = String(value).trim();
            }
            
            if (value !== '' && value !== null && value !== undefined) {
              hasData = true;
            }
          } else {
            value = '';
          }
          
          rowData[header] = value;
        });
        
        // Only add rows that have some data
        if (hasData) {
          data.push(rowData);
        }
      }
    });
    
    if (data.length === 0) {
      throw new Error('Excel file must contain at least one data row');
    }
    
    return data;
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Enhanced JSON parsing with validation
function parseJSON(fileContent: string): Record<string, any>[] {
  try {
    const parsed = JSON.parse(fileContent);
    
    if (!Array.isArray(parsed)) {
      throw new Error('JSON must contain an array of transaction objects');
    }
    
    if (parsed.length === 0) {
      throw new Error('JSON array cannot be empty');
    }
    
    // Validate that each item is an object
    parsed.forEach((item, index) => {
      if (typeof item !== 'object' || item === null) {
        throw new Error(`Item at index ${index} must be an object`);
      }
    });
    
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log('Transaction import API called');
  
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Authentication failed:', authError?.message);
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const selectedPortfolioId = formData.get('portfolioId') as string;

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!selectedPortfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${maxFileSize / 1024 / 1024}MB` 
      }, { status: 400 });
    }

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', selectedPortfolioId)
      .eq('user_id', user.id)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json({ 
        error: 'Portfolio not found or access denied' 
      }, { status: 403 });
    }

    console.log(`Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);

    // Parse file based on type
    let importedData: Record<string, any>[] = [];
    const fileName = file.name.toLowerCase();
    
    try {
      if (fileName.endsWith('.csv') || file.type === 'text/csv') {
        const fileContent = await file.text();
        importedData = await parseCSV(fileContent);
      } 
      else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || 
               file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
               file.type === 'application/vnd.ms-excel') {
        const fileBuffer = await file.arrayBuffer();
        importedData = await parseExcel(fileBuffer);
      }
      else if (fileName.endsWith('.json') || file.type === 'application/json') {
        const fileContent = await file.text();
        importedData = parseJSON(fileContent);
      }
      else {
        return NextResponse.json({ 
          error: 'Unsupported file type. Please upload CSV, Excel (.xlsx/.xls), or JSON files only.' 
        }, { status: 400 });
      }
    } catch (parseError) {
      console.error('File parsing error:', parseError);
      return NextResponse.json({ 
        error: parseError instanceof Error ? parseError.message : 'Failed to parse file'
      }, { status: 400 });
    }

    if (importedData.length === 0) {
      return NextResponse.json({ 
        error: 'No valid data found in file. Please check the file format and content.' 
      }, { status: 400 });
    }

    console.log(`Parsed ${importedData.length} rows from file`);

    // Validate data
    const validation = validateData(importedData);
    
    console.log(`Validation results: ${validation.validRows}/${validation.totalRows} valid rows, ${validation.errors.length} errors`);

    if (!validation.isValid || !validation.data) {
      // Return detailed error information
      const errorSummary = validation.errors.slice(0, 5).map(err => 
        `Row ${err.row}: ${err.error} (${err.column})`
      ).join('; ');
      
      const additionalErrors = validation.errors.length > 5 ? 
        ` and ${validation.errors.length - 5} more errors` : '';
      
      return NextResponse.json({ 
        error: `Validation failed: ${errorSummary}${additionalErrors}`,
        details: {
          totalRows: validation.totalRows,
          validRows: validation.validRows,
          errorCount: validation.errors.length,
          errors: validation.errors.slice(0, 10) // Return first 10 errors for debugging
        }
      }, { status: 400 });
    }

    // Insert transactions in batch
    console.log(`Inserting ${validation.data.length} validated transactions`);
    const insertedTransactions = [];
    const insertErrors = [];

    for (let i = 0; i < validation.data.length; i++) {
      const transaction = validation.data[i];
      try {
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
            date: transaction.date,
            notes: transaction.notes
          })
          .select()
          .single();
          
        if (error) {
          console.error(`Error inserting transaction ${i + 1}:`, error);
          insertErrors.push(`Transaction ${i + 1}: ${error.message}`);
        } else if (data) {
          insertedTransactions.push(data);
        }
      } catch (error) {
        console.error(`Unexpected error inserting transaction ${i + 1}:`, error);
        insertErrors.push(`Transaction ${i + 1}: Unexpected error`);
      }
    }

    const successCount = insertedTransactions.length;
    const errorCount = insertErrors.length;

    console.log(`Import completed: ${successCount} successful, ${errorCount} failed`);

    // Return results
    if (successCount === 0) {
      return NextResponse.json({ 
        error: 'No transactions were imported successfully',
        details: { insertErrors: insertErrors.slice(0, 10) }
      }, { status: 500 });
    }

    const response: any = {
      success: true,
      message: `Successfully imported ${successCount} transaction${successCount !== 1 ? 's' : ''}`,
      imported: successCount,
      total: validation.data.length
    };

    if (errorCount > 0) {
      response.warnings = `${errorCount} transaction${errorCount !== 1 ? 's' : ''} failed to import`;
      response.partialSuccess = true;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected import error:', error);
    return NextResponse.json({
      error: 'Internal server error during import',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}