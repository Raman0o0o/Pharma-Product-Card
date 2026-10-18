import React from 'react';
import { Loader2, FileDown, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { ProgressCallbackData } from '../utils/pdfGenerator';

interface PdfProgressModalProps {
  progress: ProgressCallbackData | null;
  isOpen: boolean;
  onCancel?: () => void;
  error?: string | null;
  onCloseError?: () => void;
}

export const PdfProgressModal: React.FC<PdfProgressModalProps> = ({
  progress,
  isOpen,
  onCancel,
  error,
  onCloseError,
}) => {
  if (!isOpen) return null;

  const isDone = progress ? progress.percent >= 100 : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative">
        {/* Error State */}
        {error ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              PDF Generation Failed
            </h3>

            <p className="text-xs text-rose-700 font-medium mt-2 mb-6 px-2 leading-relaxed bg-rose-50/70 p-3 rounded-xl border border-rose-200 w-full text-left">
              {error}
            </p>

            <button
              type="button"
              onClick={onCloseError}
              className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </>
        ) : (
          <>
            {/* Animated Icon */}
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4 shadow-xs">
              {isDone ? (
                <CheckCircle className="w-8 h-8 text-emerald-600 animate-in zoom-in-75 duration-300" />
              ) : (
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-slate-900">
              {isDone ? 'Catalogue PDF Generated!' : 'Generating A4 PDF Catalogue'}
            </h3>

            {/* Current status step (e.g. Page 1 of 160) */}
            <p className="text-sm font-semibold text-teal-800 mt-1 mb-5 min-h-[20px]">
              {progress?.step || 'Preparing PDF...'}
            </p>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-2 shadow-inner">
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  isDone ? 'bg-emerald-500' : 'bg-teal-600'
                }`}
                style={{ width: `${progress?.percent || 0}%` }}
              />
            </div>

            {/* Percentage & Page Details */}
            <div className="w-full flex items-center justify-between text-xs text-slate-500 font-mono mb-4">
              <span className="font-bold text-slate-700">
                {progress?.percent || 0}%
              </span>
              {progress?.totalPages ? (
                <span>
                  Page {progress.currentPage || 0} of {progress.totalPages}
                </span>
              ) : (
                <span>Processing...</span>
              )}
            </div>

            {isDone ? (
              <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 animate-in fade-in duration-300">
                <FileDown className="w-4 h-4" />
                File download started in your browser.
              </p>
            ) : (
              onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="mt-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-4 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel Generation
                </button>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};
