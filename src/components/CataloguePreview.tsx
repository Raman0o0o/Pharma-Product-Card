import React, { useState, useRef } from 'react';
import {
  CataloguePageData,
  CompanyInfo,
  CatalogueConfig,
  GridColumns,
  CardTheme,
} from '../types';
import { CataloguePage } from './CataloguePage';
import {
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Palette,
  Eye,
  FileCheck,
} from 'lucide-react';
import {
  generatePdfIncremental,
  ProgressCallbackData,
  CancellationToken,
} from '../utils/pdfGenerator';
import { PdfProgressModal } from './PdfProgressModal';

interface CataloguePreviewProps {
  pages: CataloguePageData[];
  companyInfo: CompanyInfo;
  config: CatalogueConfig;
  onConfigChange: (updatedConfig: CatalogueConfig) => void;
  fileName: string;
}

export const CataloguePreview: React.FC<CataloguePreviewProps> = ({
  pages,
  companyInfo,
  config,
  onConfigChange,
  fileName,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(85); // 85% default fits nicely on desktop
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<ProgressCallbackData | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const cancellationTokenRef = useRef<CancellationToken>({ aborted: false });
  const pagesContainerRef = useRef<HTMLDivElement>(null);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(130, Math.max(45, prev + delta)));
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfError(null);
    cancellationTokenRef.current = { aborted: false };

    try {
      if (pages.length === 0) {
        throw new Error('No pages available to generate PDF.');
      }

      const baseName = fileName.replace(/\.[^/.]+$/, '');
      const downloadName = baseName || 'Product_Catalogue';

      await generatePdfIncremental(
        pages,
        companyInfo,
        config,
        downloadName,
        (data) => {
          setPdfProgress(data);
        },
        cancellationTokenRef.current
      );

      // Brief delay before closing modal
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfProgress(null);
      }, 1500);
    } catch (err: any) {
      if (cancellationTokenRef.current.aborted) {
        setIsGeneratingPdf(false);
        setPdfProgress(null);
        return;
      }
      setPdfError(err.message || 'An unexpected error occurred during PDF generation.');
    }
  };

  const handleCancelPdf = () => {
    cancellationTokenRef.current.aborted = true;
    setIsGeneratingPdf(false);
    setPdfProgress(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Preview Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Columns & Theme Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Column Density Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid:
            </span>
            {(['auto', 3, 4, 5] as GridColumns[]).map((col) => (
              <button
                key={col}
                type="button"
                onClick={() =>
                  onConfigChange({
                    ...config,
                    columns: col,
                    resolvedColumns:
                      col === 'auto' ? config.resolvedColumns : (col as 3 | 4 | 5),
                  })
                }
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  config.columns === col
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {col === 'auto' ? 'Auto' : `${col} Cards`}
              </button>
            ))}
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" />
              Theme:
            </span>
            {[
              { id: 'pastel', label: 'Vibrant Print (7 Colors)' },
              { id: 'clinical', label: 'Clinical Slate' },
              { id: 'ocean', label: 'Ocean Blue' },
              { id: 'emerald', label: 'Emerald Mint' },
              { id: 'monochrome', label: 'B&W' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  onConfigChange({ ...config, theme: t.id as CardTheme })
                }
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  config.theme === t.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: View Mode, Zoom, Print & Big Download Button */}
        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Pages ({pages.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Page-by-Page
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100/80 rounded-xl p-1 text-slate-600">
            <button
              type="button"
              onClick={() => handleZoom(-10)}
              className="p-1 hover:text-slate-900 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-medium px-1.5 tabular-nums min-w-[38px] text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom(10)}
              className="p-1 hover:text-slate-900 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Native Vector Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Print or Save as Vector PDF via browser print dialogue"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">Print</span>
          </button>

          {/* Prominent Download PDF button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-md shadow-teal-700/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'GENERATING PDF...' : 'DOWNLOAD PDF'}</span>
          </button>
        </div>
      </div>

      {/* Page Navigation for Single Page View */}
      {viewMode === 'single' && (
        <div className="flex items-center justify-center gap-4 bg-white/80 backdrop-blur-xs py-2 px-4 rounded-xl border border-slate-200/70 w-fit mx-auto shadow-2xs">
          <button
            type="button"
            disabled={activePageIndex === 0}
            onClick={() => setActivePageIndex((p) => Math.max(0, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700">
            Page {activePageIndex + 1} of {pages.length}
          </span>
          <button
            type="button"
            disabled={activePageIndex === pages.length - 1}
            onClick={() =>
              setActivePageIndex((p) => Math.min(pages.length - 1, p + 1))
            }
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Preview Canvas Area */}
      <div
        ref={pagesContainerRef}
        className="w-full overflow-x-auto p-4 sm:p-8 bg-slate-200/60 rounded-2xl flex flex-col items-center gap-8 min-h-[600px]"
      >
        {viewMode === 'all' ? (
          pages.map((page, index) => (
            <div
              key={`page-container-${index}`}
              className="transition-transform origin-top"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                marginBottom: `${(1123 * (zoomLevel / 100) - 1123) / 1.8}px`,
              }}
            >
              <CataloguePage
                pageData={page}
                companyInfo={companyInfo}
                config={config}
              />
            </div>
          ))
        ) : (
          <div
            className="transition-transform origin-top"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              marginBottom: `${(1123 * (zoomLevel / 100) - 1123) / 1.8}px`,
            }}
          >
            <CataloguePage
              pageData={pages[activePageIndex] || pages[0]}
              companyInfo={companyInfo}
              config={config}
            />
          </div>
        )}
      </div>

      {/* PDF Progress Modal */}
      <PdfProgressModal
        isOpen={isGeneratingPdf || pdfError !== null}
        progress={pdfProgress}
        onCancel={handleCancelPdf}
        error={pdfError}
        onCloseError={() => {
          setPdfError(null);
          setIsGeneratingPdf(false);
        }}
      />
    </div>
  );
};
