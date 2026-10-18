import React, { useState } from 'react';
import { ParseResult } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  Layers,
  FlaskConical,
  Package,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ValidationReviewProps {
  parseResult: ParseResult;
}

export const ValidationReview: React.FC<ValidationReviewProps> = ({
  parseResult,
}) => {
  const [showIssues, setShowIssues] = useState(false);

  const totalCompositions = parseResult.groupedDosageForms.reduce(
    (acc, form) => acc + form.compositions.length,
    0
  );

  const totalDosageForms = parseResult.groupedDosageForms.length;

  const errorCount = parseResult.validationIssues.filter(
    (i) => i.type === 'error'
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Excel Data Validation & Hierarchy Summary
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            File: <span className="font-semibold text-slate-700">{parseResult.fileName}</span> ·
            Preserved Excel sequence without random reordering.
          </p>
        </div>

        {/* Validation issues toggle */}
        {parseResult.validationIssues.length > 0 && (
          <button
            type="button"
            onClick={() => setShowIssues(!showIssues)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              errorCount > 0
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {parseResult.validationIssues.length} Row Notices
            {showIssues ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Package className="w-3.5 h-3.5 text-teal-600" />
            Total Products
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {parseResult.validProductsCount}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <FlaskConical className="w-3.5 h-3.5 text-sky-600" />
            Compositions
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {totalCompositions}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Dosage Forms
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {totalDosageForms}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Column Status
          </div>
          <p className="text-xs font-semibold text-emerald-700 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            All 6 Required Mapped
          </p>
        </div>
      </div>

      {/* Dosage Forms Breakdown */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-600 block mb-2">
          Detected Dosage Categories (In Appearance Order):
        </span>
        <div className="flex flex-wrap gap-2">
          {parseResult.groupedDosageForms.map((group) => (
            <div
              key={group.normalizedForm}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span className="font-semibold">{group.normalizedForm}</span>
              <span className="text-slate-500 font-mono text-[11px]">
                ({group.totalProducts})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Issues Table */}
      {showIssues && parseResult.validationIssues.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 mb-2">
            Detailed Row Warnings & Errors
          </h4>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100 bg-slate-50 text-xs">
            {parseResult.validationIssues.map((issue, idx) => (
              <div
                key={idx}
                className="p-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      issue.type === 'error'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Row {issue.row}
                  </span>
                  <span className="text-slate-700">{issue.message}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {issue.field}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
