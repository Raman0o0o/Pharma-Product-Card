import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Download,
  Sparkles,
} from 'lucide-react';
import { parseExcelBuffer, generateSampleExcelFile } from '../utils/excelParser';
import { ParseResult } from '../types';
import { getSampleGroupedData } from '../data/sampleData';

interface ExcelUploaderProps {
  onParsed: (result: ParseResult) => void;
  onLoadSample: (pages?: number) => void;
  isLoading: boolean;
  currentFileName?: string;
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({
  onParsed,
  onLoadSample,
  isLoading,
  currentFileName,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['.xlsx', '.xls'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!hasValidExt) {
      setErrorMessage(
        'Please upload an Excel file (.xlsx or .xls). CSV or other formats are not supported.'
      );
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const result = await parseExcelBuffer(buffer, file.name);
      onParsed(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read or validate the Excel file.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            Upload Pharmaceutical Excel File
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accepts <span className="font-semibold text-slate-700">.xlsx</span> and{' '}
            <span className="font-semibold text-slate-700">.xls</span>. Files are processed
            100% locally in your browser.
          </p>
        </div>

        {/* Quick actions: Load Demo & Download Sample Template */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-teal-50/70 border border-teal-200/80 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onLoadSample()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-teal-900 hover:bg-teal-100/80 rounded-md transition-colors cursor-pointer"
              title="Load standard sample pharmaceutical catalogue"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Standard Sample
            </button>
            <span className="text-teal-300 text-xs">|</span>
            <span className="text-[10px] font-bold text-teal-700 uppercase px-1">Test:</span>
            {[10, 50, 100, 160].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => onLoadSample(count)}
                className="px-1.5 py-0.5 text-[11px] font-bold text-teal-800 hover:bg-teal-200/60 rounded transition-colors cursor-pointer"
                title={`Load calibrated ${count}-page test dataset`}
              >
                {count}p
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={generateSampleExcelFile}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Download formatted sample Excel sheet template to your computer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Download Excel Template
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
          isDragging
            ? 'border-teal-500 bg-teal-50/50 scale-[0.99]'
            : currentFileName
            ? 'border-teal-300 bg-teal-50/20 hover:border-teal-400'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
            currentFileName
              ? 'bg-teal-100 text-teal-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {currentFileName ? (
            <FileCheck className="w-6 h-6" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        {currentFileName ? (
          <div>
            <span className="text-sm font-bold text-teal-900 block">
              Active File: {currentFileName}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Click or drag another .xlsx or .xls file to replace
            </span>
          </div>
        ) : (
          <div>
            <span className="text-sm font-semibold text-slate-800 block">
              Click to select or drag and drop your Excel spreadsheet
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Expected columns: Composition, Product Name, Pack, MRP, PTR, Scheme
              (Dosage Form is optional)
            </span>
          </div>
        )}
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Validation Error</span>
            <p className="mt-0.5 leading-relaxed text-rose-800">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
