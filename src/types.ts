export interface RawProductRow {
  dosageForm?: string;
  composition: string;
  productName: string;
  pack: string;
  mrp?: string | number;
  ptr?: string | number;
  scheme?: string;
  originalRowIndex: number;
  [key: string]: any;
}

export interface ProductItem {
  id: string;
  productName: string;
  pack: string;
  mrp: string;
  ptr: string;
  scheme: string;
  dosageForm: string;
  composition: string;
  originalRowIndex: number;
}

export interface GroupedComposition {
  normalizedKey: string;
  displayHeading: string;
  dosageForm: string;
  products: ProductItem[];
}

export interface GroupedDosageForm {
  normalizedForm: string;
  compositions: GroupedComposition[];
  totalProducts: number;
}

export interface CompanyInfo {
  businessName: string;
  logoDataUrl?: string;
  phone: string;
  email: string;
  address: string;
}

export type GridColumns = 'auto' | 3 | 4 | 5;

export type CardTheme = 'clinical' | 'ocean' | 'emerald' | 'pastel' | 'monochrome';

export interface CatalogueConfig {
  columns: GridColumns;
  resolvedColumns: 3 | 4 | 5;
  theme: CardTheme;
  cardStyle: 'soft' | 'bordered' | 'vibrant';
  showContinuationHeaders: boolean;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  row: number;
  field: string;
  message: string;
}

export interface ParseResult {
  products: ProductItem[];
  groupedDosageForms: GroupedDosageForm[];
  validationIssues: ValidationIssue[];
  fileName: string;
  totalRows: number;
  validProductsCount: number;
  columnMapping: {
    composition: string;
    productName: string;
    pack: string;
    mrp: string;
    ptr: string;
    scheme: string;
    dosageForm?: string;
  };
}

export interface PageSectionItem {
  type: 'dosage_header' | 'composition_header' | 'card_row';
  dosageForm?: string;
  composition?: string;
  isContinuation?: boolean;
  cards?: ProductItem[];
  rowCardsCount?: number;
}

export interface CataloguePageData {
  pageNumber: number;
  totalPages: number;
  sections: PageSectionItem[];
}
