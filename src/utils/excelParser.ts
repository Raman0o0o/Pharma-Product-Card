import * as XLSX from 'xlsx';
import { ProductItem, ParseResult, ValidationIssue } from '../types';
import { resolveDosageForm } from './dosageDetector';
import { groupProducts } from './grouping';

/**
 * Intelligent column matching patterns
 */
const COLUMN_PATTERNS = {
  composition: [
    /^composition\s*\/?\s*generic\s*name$/i,
    /^composition$/i,
    /^generic\s*name$/i,
    /^generic$/i,
    /^salt$/i,
    /^formula$/i,
    /^active\s*ingredient$/i,
    /composition/i,
    /generic/i,
  ],
  productName: [
    /^product\s*name$/i,
    /^brand\s*name$/i,
    /^product$/i,
    /^brand$/i,
    /^item\s*name$/i,
    /^item$/i,
    /^medicine\s*name$/i,
    /^medicine$/i,
    /product/i,
    /brand/i,
  ],
  pack: [
    /^pack\s*size$/i,
    /^pack$/i,
    /^packing$/i,
    /^packaging$/i,
    /^pack\s*type$/i,
    /^size$/i,
    /pack/i,
  ],
  mrp: [
    /^maximum\s*retail\s*price$/i,
    /^max\s*retail\s*price$/i,
    /^m\.?r\.?p\.?$/i,
    /^price\s*mrp$/i,
    /^mrp\s*\(₹?\)$/i,
    /mrp/i,
  ],
  ptr: [
    /^price\s*to\s*retailer$/i,
    /^p\.?t\.?r\.?$/i,
    /^retailer\s*price$/i,
    /^rate\s*to\s*retailer$/i,
    /^ptr\s*\(₹?\)$/i,
    /ptr/i,
  ],
  scheme: [
    /^scheme$/i,
    /^offer$/i,
    /^bonus$/i,
    /^free\s*scheme$/i,
    /^free$/i,
    /^deal$/i,
    /scheme/i,
  ],
  dosageForm: [
    /^dosage\s*form$/i,
    /^dosage$/i,
    /^dosageform$/i,
    /^form$/i,
    /^product\s*type$/i,
    /^type$/i,
    /^category$/i,
  ],
};

function matchColumn(header: string, patterns: RegExp[]): boolean {
  const cleanHeader = header.trim();
  for (const pattern of patterns) {
    if (pattern.test(cleanHeader)) {
      return true;
    }
  }
  return false;
}

/**
 * Maps raw sheet header keys to normalized column identifiers
 */
function detectColumns(headers: string[]): {
  mapping: Record<string, string>;
  missingRequired: string[];
} {
  const mapping: Record<string, string> = {};
  const matched = new Set<string>();

  // Helper to find match
  const findMatch = (key: keyof typeof COLUMN_PATTERNS) => {
    for (const h of headers) {
      if (matched.has(h)) continue;
      if (matchColumn(h, COLUMN_PATTERNS[key])) {
        mapping[key] = h;
        matched.add(h);
        return;
      }
    }
  };

  // Exact & prioritized matches
  findMatch('composition');
  findMatch('productName');
  findMatch('pack');
  findMatch('mrp');
  findMatch('ptr');
  findMatch('scheme');
  findMatch('dosageForm');

  const requiredFields: Array<keyof typeof COLUMN_PATTERNS> = [
    'composition',
    'productName',
    'pack',
    'mrp',
    'ptr',
    'scheme',
  ];

  const fieldLabels: Record<string, string> = {
    composition: 'Composition / Generic Name',
    productName: 'Product Name',
    pack: 'Pack',
    mrp: 'MRP',
    ptr: 'PTR',
    scheme: 'Scheme',
  };

  const missingRequired: string[] = [];
  for (const f of requiredFields) {
    if (!mapping[f]) {
      missingRequired.push(fieldLabels[f]);
    }
  }

  return { mapping, missingRequired };
}

/**
 * Formats pricing string with "Rs. <amount>" without altering values or inserting fake zeroes
 */
export function formatCurrencyValue(val: any): string {
  if (val === undefined || val === null) return '';
  let str = String(val).trim();
  if (str === '') return '';

  // If starts with ₹, replace with Rs.
  if (str.startsWith('₹')) {
    const numPart = str.substring(1).trim();
    return numPart ? `Rs. ${numPart}` : '';
  }

  // If already starts with Rs or Rs., standardize to Rs. <amount>
  if (/^Rs\.?\s*/i.test(str)) {
    const numPart = str.replace(/^Rs\.?\s*/i, '').trim();
    return numPart ? `Rs. ${numPart}` : '';
  }

  // If valid number, prefix with Rs. cleanly
  const num = parseFloat(str.replace(/[^\d.-]/g, ''));
  if (!isNaN(num) && /^-?\d+(\.\d+)?$/.test(str.replace(/,/g, ''))) {
    return `Rs. ${str}`;
  }

  return str;
}

/**
 * Parses an Excel file (.xlsx or .xls) from an ArrayBuffer client-side
 */
export async function parseExcelBuffer(
  buffer: ArrayBuffer,
  fileName: string
): Promise<ParseResult> {
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: false,
    cellNF: false,
    cellText: true,
  });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('The uploaded Excel file does not contain any sheets.');
  }

  // Use the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to 2D array to inspect headers and rows
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (rows.length === 0) {
    throw new Error('The uploaded Excel sheet is empty.');
  }

  // Find header row (the first row with non-empty cells)
  let headerRowIndex = 0;
  while (headerRowIndex < rows.length && (!rows[headerRowIndex] || rows[headerRowIndex].filter(c => String(c).trim() !== '').length < 3)) {
    headerRowIndex++;
  }

  if (headerRowIndex >= rows.length) {
    throw new Error('Could not find a valid table header row in the uploaded Excel file.');
  }

  const rawHeaders = rows[headerRowIndex].map(h => String(h || '').trim());
  const { mapping, missingRequired } = detectColumns(rawHeaders);

  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required column: ${missingRequired.join(', ')}. Please verify that your Excel file includes columns for: Composition, Product Name, Pack, MRP, PTR, Scheme.`
    );
  }

  // Extract column indexes
  const colIndexMap = {
    composition: rawHeaders.indexOf(mapping.composition),
    productName: rawHeaders.indexOf(mapping.productName),
    pack: rawHeaders.indexOf(mapping.pack),
    mrp: rawHeaders.indexOf(mapping.mrp),
    ptr: rawHeaders.indexOf(mapping.ptr),
    scheme: rawHeaders.indexOf(mapping.scheme),
    dosageForm: mapping.dosageForm ? rawHeaders.indexOf(mapping.dosageForm) : -1,
  };

  const validationIssues: ValidationIssue[] = [];
  const products: ProductItem[] = [];

  // Iterate rows in exact Excel sequence
  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    const excelRowNumber = r + 1; // 1-indexed for user-friendly error messages

    // Check if entire row is empty
    if (!row || row.every((c: any) => String(c ?? '').trim() === '')) {
      continue;
    }

    const rawProductName = String(row[colIndexMap.productName] ?? '').trim();
    const rawComposition = String(row[colIndexMap.composition] ?? '').trim();
    const rawPack = String(row[colIndexMap.pack] ?? '').trim();
    const rawMrp = row[colIndexMap.mrp] ?? '';
    const rawPtr = row[colIndexMap.ptr] ?? '';
    const rawScheme = row[colIndexMap.scheme] ?? '';
    const rawDosageForm = colIndexMap.dosageForm >= 0 ? String(row[colIndexMap.dosageForm] ?? '').trim() : '';

    // Validation checks
    if (!rawProductName && !rawComposition) {
      validationIssues.push({
        type: 'warning',
        row: excelRowNumber,
        field: 'General',
        message: `Row ${excelRowNumber}: Skipped empty product record.`,
      });
      continue;
    }

    if (!rawProductName) {
      validationIssues.push({
        type: 'error',
        row: excelRowNumber,
        field: 'Product Name',
        message: `Row ${excelRowNumber}: Product Name is empty.`,
      });
    }

    if (!rawComposition) {
      validationIssues.push({
        type: 'error',
        row: excelRowNumber,
        field: 'Composition',
        message: `Row ${excelRowNumber}: Composition is empty.`,
      });
    }

    // Resolve Dosage Form: explicit Excel value has highest priority; fallback to auto-detection
    const resolvedForm = resolveDosageForm(
      rawDosageForm,
      rawProductName,
      rawPack,
      rawComposition
    );

    const formattedMrp = formatCurrencyValue(rawMrp);
    const formattedPtr = formatCurrencyValue(rawPtr);
    const formattedScheme = String(rawScheme ?? '').trim();

    products.push({
      id: `prod-${r}-${Date.now().toString(36)}`,
      productName: rawProductName || 'UNNAMED PRODUCT',
      pack: rawPack,
      mrp: formattedMrp,
      ptr: formattedPtr,
      scheme: formattedScheme,
      dosageForm: resolvedForm,
      composition: rawComposition || 'GENERAL COMPOSITION',
      originalRowIndex: excelRowNumber,
    });
  }

  if (products.length === 0) {
    throw new Error('No valid product rows were found in the uploaded Excel file.');
  }

  // Group by dosage form then composition while preserving exact Excel order
  const groupedDosageForms = groupProducts(products);

  return {
    products,
    groupedDosageForms,
    validationIssues,
    fileName,
    totalRows: rows.length - headerRowIndex - 1,
    validProductsCount: products.length,
    columnMapping: {
      composition: mapping.composition,
      productName: mapping.productName,
      pack: mapping.pack,
      mrp: mapping.mrp,
      ptr: mapping.ptr,
      scheme: mapping.scheme,
      dosageForm: mapping.dosageForm,
    },
  };
}

/**
 * Creates and triggers download of a sample Excel workbook (.xlsx)
 */
export function generateSampleExcelFile(): void {
  const sampleData = [
    {
      'Dosage Form': 'Tablets',
      'Composition / Generic Name': 'Aceclofenac 100 MG & Paracetamol 325 MG',
      'Product Name': 'ACEVIX-P TAB',
      'Pack': '10×10 BLISTER',
      'MRP': '62.81',
      'PTR': '47.86',
      'Scheme': '10+10',
    },
    {
      'Dosage Form': 'Tablets',
      'Composition / Generic Name': 'Aceclofenac 100 MG & Paracetamol 325 MG',
      'Product Name': 'ACEVION-P TAB',
      'Pack': '10×10 BLISTER',
      'MRP': '72.00',
      'PTR': '45.00',
      'Scheme': '10+5',
    },
    {
      'Dosage Form': 'Tablets',
      'Composition / Generic Name': 'Azithromycin 500 MG',
      'Product Name': 'AZIKEM 500 TAB',
      'Pack': '1×3 BLISTER',
      'MRP': '71.50',
      'PTR': '54.20',
      'Scheme': '10+2',
    },
    {
      'Dosage Form': 'Tablets',
      'Composition / Generic Name': 'Azithromycin 500 MG',
      'Product Name': 'AZIFINE 500 TAB',
      'Pack': '1×5 STRIP',
      'MRP': '118.00',
      'PTR': '89.50',
      'Scheme': '',
    },
    {
      'Dosage Form': '', // Blank to test auto-detection from "TAB"
      'Composition / Generic Name': 'Telmisartan 40 MG + Amlodipine 5 MG',
      'Product Name': 'TELMA-AM TAB',
      'Pack': '10×10 ALU-ALU',
      'MRP': '145.00',
      'PTR': '110.00',
      'Scheme': '10+1',
    },
    {
      'Dosage Form': 'Capsules',
      'Composition / Generic Name': 'Omeprazole 20 MG & Domperidone 10 MG',
      'Product Name': 'OMECIP-D CAPS',
      'Pack': '10×10 STRIP',
      'MRP': '68.50',
      'PTR': '52.00',
      'Scheme': '10+5',
    },
    {
      'Dosage Form': 'Capsules',
      'Composition / Generic Name': 'Omeprazole 20 MG & Domperidone 10 MG',
      'Product Name': 'OMEE-D CAPS',
      'Pack': '10×10 ALU-ALU',
      'MRP': '84.00',
      'PTR': '63.80',
      'Scheme': '10+10',
    },
    {
      'Dosage Form': 'Capsules',
      'Composition / Generic Name': 'Itraconazole 200 MG',
      'Product Name': 'ITRASYS 200 CAPS',
      'Pack': '10×1×4 ALU-ALU',
      'MRP': '210.00',
      'PTR': '160.00',
      'Scheme': '5+1',
    },
    {
      'Dosage Form': 'Syrups',
      'Composition / Generic Name': 'Terbutaline 1.25 MG + Bromhexine 4 MG + Guaiphenesin 50 MG + Menthol 2.5 MG',
      'Product Name': 'KOFREST SYRUP',
      'Pack': '100 ML BOTTLE',
      'MRP': '88.00',
      'PTR': '66.80',
      'Scheme': '10+2',
    },
    {
      'Dosage Form': 'Syrups',
      'Composition / Generic Name': 'Terbutaline 1.25 MG + Bromhexine 4 MG + Guaiphenesin 50 MG + Menthol 2.5 MG',
      'Product Name': 'COFLIN EXPECTORANT',
      'Pack': '100 ML PET BOTTLE',
      'MRP': '92.50',
      'PTR': '70.30',
      'Scheme': '10+3',
    },
    {
      'Dosage Form': '', // Blank to test auto-detection of DRY SYRUPS
      'Composition / Generic Name': 'Amoxicillin 200 MG + Potassium Clavulanate 28.5 MG / 5 ML',
      'Product Name': 'MOXIKIND-CV DRY SYRUP',
      'Pack': '30 ML WITH WFI',
      'MRP': '65.20',
      'PTR': '49.50',
      'Scheme': '10+1',
    },
    {
      'Dosage Form': 'Injections',
      'Composition / Generic Name': 'Ceftriaxone 1000 MG',
      'Product Name': 'CEFTRI-1G INJ',
      'Pack': '1 VIAL WITH WFI',
      'MRP': '59.00',
      'PTR': '44.80',
      'Scheme': '10+5',
    },
    {
      'Dosage Form': 'Injections',
      'Composition / Generic Name': 'Pantoprazole 40 MG',
      'Product Name': 'PANTO-40 INJ',
      'Pack': '1 VIAL WITH BOX',
      'MRP': '52.50',
      'PTR': '39.90',
      'Scheme': '10+10',
    },
    {
      'Dosage Form': '', // Blank to test auto-detection of OINTMENTS
      'Composition / Generic Name': 'Clobetasol Propionate 0.05% + Neomycin Sulphate 0.5% + Miconazole Nitrate 2.0%',
      'Product Name': 'CLOBE-GM OINTMENT',
      'Pack': '15 GM TUBE',
      'MRP': '65.00',
      'PTR': '49.40',
      'Scheme': '10+2',
    },
    {
      'Dosage Form': 'Gels',
      'Composition / Generic Name': 'Diclofenac Diethylamine 1.16% + Linseed Oil 3% + Methyl Salicylate 10% + Menthol 5%',
      'Product Name': 'VOLTA-GEL',
      'Pack': '30 GM LAMI TUBE',
      'MRP': '95.00',
      'PTR': '72.20',
      'Scheme': '10+3',
    },
    {
      'Dosage Form': '', // Blank to test auto-detection of EYE DROPS
      'Composition / Generic Name': 'Carboxymethylcellulose Sodium 0.5% w/v',
      'Product Name': 'TEARS-REFRESH EYE DROPS',
      'Pack': '10 ML VIAL',
      'MRP': '120.00',
      'PTR': '91.20',
      'Scheme': '10+2',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  // Generate file download
  XLSX.writeFile(wb, 'Pharmaceutical_Product_Sample_Template.xlsx');
}
