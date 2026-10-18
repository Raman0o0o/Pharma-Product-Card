import React from 'react';
import { CataloguePageData, CompanyInfo, CatalogueConfig } from '../types';
import { ProductCard } from './ProductCard';

interface CataloguePageProps {
  pageData: CataloguePageData;
  companyInfo: CompanyInfo;
  config: CatalogueConfig;
}

export const CataloguePage: React.FC<CataloguePageProps> = ({
  pageData,
  companyInfo,
  config,
}) => {
  const hasCompanyData =
    Boolean(companyInfo.businessName) ||
    Boolean(companyInfo.logoDataUrl) ||
    Boolean(companyInfo.phone) ||
    Boolean(companyInfo.email) ||
    Boolean(companyInfo.address);

  const gridColsClass =
    config.resolvedColumns === 3
      ? 'grid-cols-3'
      : config.resolvedColumns === 5
      ? 'grid-cols-5'
      : 'grid-cols-4';

  // Track global card index sequentially across rows on this page
  // so the 7 curated colors cycle seamlessly:
  // Green (#A8E063) -> Blue (#64B5F6) -> Purple (#CE93D8) -> Yellow (#FFD54F) -> Orange (#FFB74D) -> Pink (#F48FB1) -> Cyan (#4DD0E1)
  let cardSequentialCounter = 0;

  return (
    <div
      className="a4-page relative mx-auto flex flex-col justify-between print:shadow-none print:m-0"
      style={{
        width: '794px',
        height: '1123px',
        padding: '24px 28px',
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
        color: '#111111',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        fontFamily: 'Arial, Helvetica, sans-serif',
        overflow: 'visible',
      }}
    >
      {/* Top Section: Company Header & Main Content */}
      <div className="flex-1 flex flex-col" style={{ overflow: 'visible' }}>
        {/* Company Header (Repeated on every page) */}
        {hasCompanyData ? (
          <header
            className="mb-3.5 pb-2.5 flex items-start justify-between gap-5 shrink-0"
            style={{
              borderBottom: '1px solid #E0E0E0',
              fontFamily: 'Arial, Helvetica, sans-serif',
              overflow: 'visible',
            }}
          >
            {/* Logo & Business Name Lockup */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {companyInfo.logoDataUrl && (
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ minWidth: '80px', maxWidth: '140px', height: '56px' }}
                >
                  <img
                    src={companyInfo.logoDataUrl}
                    alt="Company Logo"
                    className="max-h-[56px] max-w-[140px] object-contain"
                  />
                </div>
              )}
              {companyInfo.businessName && (
                <div className="min-w-0">
                  <h1
                    className="text-lg font-black uppercase tracking-tight"
                    style={{
                      color: '#111111',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      lineHeight: '22px',
                      margin: '0',
                    }}
                  >
                    {companyInfo.businessName}
                  </h1>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mt-0.5"
                    style={{
                      color: '#263238',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      lineHeight: '14px',
                      margin: '0',
                    }}
                  >
                    Pharmaceutical Product Catalogue
                  </p>
                </div>
              )}
            </div>

            {/* Contact Details & Complete Address (Only non-empty fields) */}
            <div
              className="text-right shrink-0"
              style={{
                color: '#263238',
                fontFamily: 'Arial, Helvetica, sans-serif',
                maxWidth: '360px',
                overflow: 'visible',
              }}
            >
              {(companyInfo.phone || companyInfo.email) && (
                <div
                  className="flex items-center justify-end gap-2 font-semibold text-[10.5px]"
                  style={{
                    lineHeight: '15px',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    color: '#263238',
                    marginBottom: companyInfo.address ? '3px' : '0',
                  }}
                >
                  {companyInfo.phone && <span>Tel: {companyInfo.phone}</span>}
                  {companyInfo.phone && companyInfo.email && (
                    <span style={{ color: '#B0BEC5' }}>|</span>
                  )}
                  {companyInfo.email && <span>{companyInfo.email}</span>}
                </div>
              )}

              {/* Complete Address: Natural line wrapping, no truncation, no ellipsis, no single-line clipping */}
              {companyInfo.address && (
                <div
                  style={{
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: '10px',
                    lineHeight: '14px',
                    fontWeight: 500,
                    color: '#37474F',
                    textAlign: 'right',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflow: 'visible',
                    margin: '0',
                    padding: '0',
                  }}
                >
                  {companyInfo.address}
                </div>
              )}
            </div>
          </header>
        ) : (
          <header
            className="mb-3 pb-2 flex items-center justify-between text-xs shrink-0"
            style={{
              borderBottom: '1px solid #EEEEEE',
              color: '#546E7A',
              fontFamily: 'Arial, Helvetica, sans-serif',
            }}
          >
            <span
              className="font-bold tracking-wider uppercase text-[11px]"
              style={{ color: '#263238', fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              Product Catalogue
            </span>
            <span className="text-[10px]" style={{ color: '#78909C', fontFamily: 'Arial, Helvetica, sans-serif' }}>
              A4 Portrait Print Edition
            </span>
          </header>
        )}

        {/* Page Content: Dosage Form Banners, Composition Headings, Product Card Grids */}
        <div className="flex-1 space-y-3" style={{ overflow: 'visible' }}>
          {pageData.sections.map((section, idx) => {
            if (section.type === 'dosage_header') {
              return (
                <div
                  key={`dh-${idx}`}
                  className="rounded-xl mt-1"
                  style={{
                    backgroundColor: '#009688',
                    color: '#FFFFFF',
                    border: '1px solid #00796B',
                    minHeight: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    boxSizing: 'border-box',
                    overflow: 'visible',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      height: '100%',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        flexShrink: 0,
                      }}
                    />
                    <h2
                      style={{
                        color: '#FFFFFF',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        fontSize: '14px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        lineHeight: 1,
                        margin: 0,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {section.dosageForm}
                    </h2>
                  </div>
                </div>
              );
            }

            if (section.type === 'composition_header') {
              return (
                <div
                  key={`ch-${idx}`}
                  className="rounded-lg"
                  style={{
                    backgroundColor: '#FFD600',
                    color: '#111111',
                    border: '1px solid #E6C200',
                    minHeight: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 12px',
                    boxSizing: 'border-box',
                    overflow: 'visible',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                      minWidth: 0,
                      overflow: 'visible',
                    }}
                  >
                    <h3
                      style={{
                        color: '#111111',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        fontSize: '12px',
                        fontWeight: 900,
                        lineHeight: '16px',
                        letterSpacing: '0.01em',
                        margin: 0,
                        padding: 0,
                        wordBreak: 'break-word',
                        display: 'block',
                      }}
                    >
                      {section.composition}
                    </h3>
                  </div>
                  {section.isContinuation && (
                    <span
                      style={{
                        backgroundColor: '#FFF176',
                        color: '#111111',
                        border: '1px solid #FBC02D',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        lineHeight: 1,
                        padding: '3px 6px',
                        borderRadius: '4px',
                        flexShrink: 0,
                        marginLeft: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      Continued
                    </span>
                  )}
                </div>
              );
            }

            if (section.type === 'card_row' && section.cards) {
              return (
                <div
                  key={`cr-${idx}`}
                  className={`grid ${gridColsClass} gap-2.5 items-stretch`}
                >
                  {section.cards.map((product) => {
                    const currentIndex = cardSequentialCounter++;
                    return (
                      <ProductCard
                        key={product.id || `card-${currentIndex}`}
                        product={product}
                        theme={config.theme}
                        index={currentIndex}
                        columns={config.resolvedColumns}
                      />
                    );
                  })}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* Page Footer (Page Numbering & Document Meta) */}
      <footer
        className="mt-3 pt-2 flex items-center justify-between text-[10px] shrink-0"
        style={{
          borderTop: '1px solid #E0E0E0',
          color: '#263238',
        }}
      >
        <div className="flex items-center gap-2 font-medium">
          <span>Pharmaceutical Product Catalogue</span>
          <span>·</span>
          <span>Trade & Clinical Reference</span>
        </div>
        <div
          className="font-bold tabular-nums"
          style={{ color: '#111111' }}
        >
          Page {pageData.pageNumber} of {pageData.totalPages}
        </div>
      </footer>
    </div>
  );
};
