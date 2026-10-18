import React, { useRef } from 'react';
import { CompanyInfo } from '../types';
import { Building2, Phone, Mail, MapPin, Upload, X, Image as ImageIcon } from 'lucide-react';

interface CompanyInfoFormProps {
  companyInfo: CompanyInfo;
  onChange: (updated: CompanyInfo) => void;
}

export const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({
  companyInfo,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onChange({
        ...companyInfo,
        logoDataUrl: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange({
      ...companyInfo,
      logoDataUrl: undefined,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            Company Header Information
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Appears at the top of every PDF page. All fields are completely optional.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Logo Upload Box (Aspect ratio preserved preview) */}
        <div className="md:col-span-4 lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Company Logo (Optional)
          </label>
          {companyInfo.logoDataUrl ? (
            <div className="relative group rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex flex-col items-center justify-center min-h-[110px]">
              <img
                src={companyInfo.logoDataUrl}
                alt="Logo preview"
                className="max-h-20 max-w-full object-contain rounded"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-full shadow-xs border border-slate-200 transition-colors"
                title="Remove logo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-slate-400 mt-2">
                Click trash to change logo
              </span>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] group"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-teal-100/60 flex items-center justify-center text-slate-500 group-hover:text-teal-600 transition-colors mb-2">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-700 group-hover:text-teal-700">
                Upload Logo
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG, or SVG
              </span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>

        {/* Input Details Grid */}
        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Business Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business / Company Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Apex Pharma Laboratories Ltd."
                value={companyInfo.businessName}
                onChange={(e) =>
                  onChange({ ...companyInfo, businessName: e.target.value })
                }
                className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={companyInfo.phone}
                onChange={(e) =>
                  onChange({ ...companyInfo, phone: e.target.value })
                }
                className="w-full text-sm rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="email"
                placeholder="e.g. contact@apexpharma.com"
                value={companyInfo.email}
                onChange={(e) =>
                  onChange({ ...companyInfo, email: e.target.value })
                }
                className="w-full text-sm rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Office / Facility Address (Full multi-line address)
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <textarea
                rows={2}
                placeholder="e.g. Plot No. 42, Industrial Area Phase II, Near XYZ Road, Bhubaneswar, Odisha - 751001, India"
                value={companyInfo.address}
                onChange={(e) =>
                  onChange({ ...companyInfo, address: e.target.value })
                }
                className="w-full text-sm rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors resize-y leading-snug"
              />
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1">
              Displays completely on every catalogue page and PDF header without truncation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
