import React from 'react';
import { Pill, Sparkles, Download, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onDownloadTemplate: () => void;
  hasData: boolean;
  onScrollToPreview?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onDownloadTemplate,
  hasData,
  onScrollToPreview,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2 whitespace-nowrap shrink-0 hover:text-teal-700 transition-colors"
        >
          <span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <Pill className="w-4 h-4" />
          </span>
          <span>PRODUCT CARD GENERATOR</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a
            href="#company-section"
            className="hover:text-slate-900 transition-colors"
          >
            Company
          </a>
          <a
            href="#upload-section"
            className="hover:text-slate-900 transition-colors"
          >
            Upload
          </a>
          <a
            href="#preview-section"
            className="hover:text-slate-900 transition-colors"
          >
            Catalogue Preview
          </a>
        </nav>

        {/* Zone 3: Primary Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Load Sample Data</span>
          </button>

          {hasData && onScrollToPreview && (
            <button
              type="button"
              onClick={onScrollToPreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>View Catalogue</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
