import React, { useState, useMemo, useEffect } from 'react';
import {
  CompanyInfo,
  ParseResult,
  CatalogueConfig,
  ProductItem,
} from './types';
import { Header } from './components/Header';
import { CompanyInfoForm } from './components/CompanyInfoForm';
import { ExcelUploader } from './components/ExcelUploader';
import { ValidationReview } from './components/ValidationReview';
import { CataloguePreview } from './components/CataloguePreview';
import {
  getSampleGroupedData,
  getScaledSampleData,
  SAMPLE_PRODUCTS_DATA,
} from './data/sampleData';
import { generateSampleExcelFile } from './utils/excelParser';
import { resolveGridColumns, paginateCatalogue } from './utils/pagination';
import {
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  LayoutGrid,
  FileDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

// Default sleek pharmaceutical logo SVG as data URL
const DEFAULT_DEMO_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50" fill="none"><rect width="40" height="40" y="5" rx="10" fill="%230d9488"/><path d="M20 15v20M10 25h20" stroke="%23ffffff" stroke-width="4" stroke-linecap="round"/><text x="48" y="26" fill="%230f172a" font-family="sans-serif" font-weight="800" font-size="15" letter-spacing="-0.5">APEX PHARMA</text><text x="48" y="38" fill="%2364748b" font-family="sans-serif" font-weight="600" font-size="8.5" letter-spacing="1">LABORATORIES LTD.</text></svg>`;

export default function App() {
  // Step 1: Company Info
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    businessName: 'Apex Pharma Laboratories Ltd.',
    logoDataUrl: DEFAULT_DEMO_LOGO,
    phone: '+91 98765 43210',
    email: 'contact@apexpharma.com',
    address: 'Plot No. 42, Industrial Area Phase II, Near XYZ Road, Bhubaneswar, Odisha - 751001, India',
  });

  // Step 2 & 3: Excel Parse Result
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Step 4: Catalogue Configuration
  const [config, setConfig] = useState<CatalogueConfig>({
    columns: 'auto',
    resolvedColumns: 4,
    theme: 'pastel',
    cardStyle: 'soft',
    showContinuationHeaders: true,
  });

  // Load sample dataset on mount so the user immediately sees a working catalogue
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = (scalePages?: number) => {
    setIsLoading(true);
    const demo = scalePages
      ? getScaledSampleData(scalePages)
      : getSampleGroupedData();

    setParseResult({
      products: demo.products,
      groupedDosageForms: demo.groupedDosageForms,
      validationIssues: [],
      fileName: scalePages
        ? `Stress_Test_${scalePages}_Pages.xlsx`
        : 'Sample_Pharmaceutical_Catalogue.xlsx',
      totalRows: demo.products.length,
      validProductsCount: demo.products.length,
      columnMapping: {
        composition: 'Composition / Generic Name',
        productName: 'Product Name',
        pack: 'Pack',
        mrp: 'MRP',
        ptr: 'PTR',
        scheme: 'Scheme',
        dosageForm: 'Dosage Form',
      },
    });

    setIsLoading(false);
  };

  const handleExcelParsed = (result: ParseResult) => {
    setParseResult(result);
  };

  // Determine resolved column count based on current data
  const resolvedCols = useMemo(() => {
    if (!parseResult) return 4;
    return resolveGridColumns(parseResult.products, config.columns);
  }, [parseResult, config.columns]);

  // Keep config in sync with resolved columns
  const effectiveConfig = useMemo(() => {
    return {
      ...config,
      resolvedColumns: resolvedCols,
    };
  }, [config, resolvedCols]);

  // Calculate intelligent A4 pagination
  const pages = useMemo(() => {
    if (!parseResult || parseResult.groupedDosageForms.length === 0) {
      return [];
    }
    return paginateCatalogue(
      parseResult.groupedDosageForms,
      effectiveConfig.resolvedColumns,
      effectiveConfig.showContinuationHeaders
    );
  }, [parseResult, effectiveConfig.resolvedColumns, effectiveConfig.showContinuationHeaders]);

  const scrollToPreview = () => {
    const el = document.getElementById('preview-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      {/* Top Bar */}
      <Header
        onLoadSample={loadSampleData}
        onDownloadTemplate={generateSampleExcelFile}
        hasData={Boolean(parseResult)}
        onScrollToPreview={scrollToPreview}
      />

      {/* Main Workflow Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>100% Client-Side · Zero Server Upload · Print-Ready A4 Portrait</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            PRODUCT CARD GENERATOR
          </h1>
          <p className="mt-2 text-base text-slate-600 font-medium">
            Create a professional pharmaceutical product catalogue directly from Excel.
          </p>

          {/* 5-Step Process Bar */}
          <div className="mt-6 grid grid-cols-5 gap-2 text-center text-xs font-semibold text-slate-600 border border-slate-200 bg-white rounded-2xl p-2.5 shadow-2xs">
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                1
              </span>
              <span className="truncate max-w-full">Company Info</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                2
              </span>
              <span className="truncate max-w-full">Upload Excel</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                3
              </span>
              <span className="truncate max-w-full">Validate Data</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                4
              </span>
              <span className="truncate max-w-full">Product Cards</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                5
              </span>
              <span className="truncate max-w-full">Download PDF</span>
            </div>
          </div>
        </section>

        {/* STEP 1: Company Information */}
        <section id="company-section" className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Step 1: Enter Company Information</span>
          </div>
          <CompanyInfoForm
            companyInfo={companyInfo}
            onChange={setCompanyInfo}
          />
        </section>

        {/* STEP 2: Excel Upload */}
        <section id="upload-section" className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Step 2: Upload Excel File</span>
          </div>
          <ExcelUploader
            onParsed={handleExcelParsed}
            onLoadSample={loadSampleData}
            isLoading={isLoading}
            currentFileName={parseResult?.fileName}
          />
        </section>

        {/* STEP 3: Review Detected Data */}
        {parseResult && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Step 3: Review Detected Data & Grouping</span>
            </div>
            <ValidationReview parseResult={parseResult} />
          </section>
        )}

        {/* STEP 4 & 5: Generate Product Cards & Download PDF */}
        {parseResult && pages.length > 0 && (
          <section id="preview-section" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                  4
                </span>
                <span>Step 4 & 5: Interactive Product Card Preview & PDF Download</span>
              </div>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                {pages.length} A4 Pages Generated
              </span>
            </div>

            <CataloguePreview
              pages={pages}
              companyInfo={companyInfo}
              config={effectiveConfig}
              onConfigChange={setConfig}
              fileName={parseResult.fileName}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-700">
            Product Card Generator · Standalone Client-Side Application
          </p>
          <p className="text-slate-400">
            Your pharmaceutical data stays securely on your device.
          </p>
        </div>
      </footer>
    </div>
  );
}
