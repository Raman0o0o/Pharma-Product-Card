import jsPDF from 'jspdf';
import { CataloguePageData, CompanyInfo, CatalogueConfig, CardTheme } from '../types';

export interface ProgressCallbackData {
  step: string;
  percent: number;
  currentPage?: number;
  totalPages?: number;
}

export type ProgressCallback = (data: ProgressCallbackData) => void;

export interface CancellationToken {
  aborted: boolean;
}

// 7 Curated Print-Safe Vibrant Colors
// Green -> Blue -> Purple -> Yellow -> Orange -> Pink -> Cyan
const PRINT_SAFE_PALETTE = [
  { name: 'Green', bg: '#A8E063', border: '#82C437', divider: '#95D44F' },
  { name: 'Blue', bg: '#64B5F6', border: '#42A5F5', divider: '#55A6E8' },
  { name: 'Purple', bg: '#CE93D8', border: '#BA68C8', divider: '#C183CB' },
  { name: 'Yellow', bg: '#FFD54F', border: '#FFCA28', divider: '#F0C43B' },
  { name: 'Orange', bg: '#FFB74D', border: '#FFA726', divider: '#F0A536' },
  { name: 'Pink', bg: '#F48FB1', border: '#F06292', divider: '#E57D9F' },
  { name: 'Cyan', bg: '#4DD0E1', border: '#26C6DA', divider: '#3EC1D2' },
];

/**
 * Normalizes any monetary value to standard "Rs. <value>"
 * Examples:
 * ₹76 -> Rs. 76
 * ₹60.35 -> Rs. 60.35
 * ₹760 -> Rs. 760
 * ₹579.05 -> Rs. 579.05
 * 76 -> Rs. 76
 * Rs. 76 -> Rs. 76
 */
export function normalizePriceToRs(rawPrice: any): string {
  if (rawPrice === undefined || rawPrice === null) return '—';
  let str = String(rawPrice).trim();
  if (str === '' || str === '—') return '—';

  // Strip existing ₹ symbol
  if (str.startsWith('₹')) {
    str = str.substring(1).trim();
  }

  // Normalize existing "Rs" or "Rs."
  if (/^Rs\.?\s*/i.test(str)) {
    str = str.replace(/^Rs\.?\s*/i, '').trim();
  }

  return str ? `Rs. ${str}` : '—';
}

/**
 * Draws price string in standard PDF-safe Helvetica font with "Rs. <value>".
 * Real selectable, standard ASCII vector text with maximum PDF compatibility.
 */
function drawPrice(
  doc: jsPDF,
  rawPrice: string,
  x: number,
  y: number,
  size: number,
  color: string,
  align: 'left' | 'right'
) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size);
  doc.setTextColor(color);

  const priceText = normalizePriceToRs(rawPrice);

  if (align === 'left') {
    doc.text(priceText, x, y);
  } else {
    doc.text(priceText, x, y, { align: 'right' });
  }
}

/**
 * Measures natural image dimensions from a Data URL.
 * Preserves true aspect ratio for contain-fit scaling in PDF rendering.
 */
async function getImageDimensionsFromDataUrl(dataUrl: string): Promise<{ width: number; height: number }> {
  if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth || img.width || 1,
          height: img.naturalHeight || img.height || 1,
        });
      };
      img.onerror = () => {
        resolve({ width: 1, height: 1 });
      };
      img.src = dataUrl;
      if (img.complete && (img.naturalWidth || img.width)) {
        resolve({
          width: img.naturalWidth || img.width || 1,
          height: img.naturalHeight || img.height || 1,
        });
      }
    });
  }

  // Binary header extraction fallback (works in Node and server environments)
  try {
    if (dataUrl.startsWith('data:image/png;base64,')) {
      const b64 = dataUrl.substring('data:image/png;base64,'.length);
      const bin = typeof Buffer !== 'undefined' ? Buffer.from(b64.substring(0, 48), 'base64') : null;
      if (bin && bin.length >= 24 && bin[1] === 0x50 && bin[2] === 0x4e && bin[3] === 0x47) {
        const width = bin.readUInt32BE(16);
        const height = bin.readUInt32BE(20);
        return { width, height };
      }
    }
  } catch {
    // Ignore fallback errors
  }

  return { width: 1, height: 1 };
}

/**
 * Memory-efficient, 100% native vector PDF generator.
 *
 * Direct PDF-Native Architecture:
 * DATA -> EXPLICIT VECTOR SHAPES & TEXT -> PDF BLOB
 *
 * Features:
 * - 0% dependence on html2canvas or DOM rasterization screenshots.
 * - Real selectable, searchable vector text with perfect font baselines.
 * - Mathematically centered text inside dosage banners, compositions, and cards.
 * - Handles 10, 50, 100, 150, 200+ pages incrementally with minimal memory footprint.
 */
export async function generatePdfIncremental(
  pages: CataloguePageData[],
  companyInfo: CompanyInfo,
  config: CatalogueConfig,
  fileName: string = 'Product_Catalogue',
  onProgress?: ProgressCallback,
  cancellationToken?: CancellationToken
): Promise<void> {
  const total = pages.length;
  if (total === 0) {
    throw new Error('No pages available to generate PDF.');
  }

  onProgress?.({
    step: 'Initializing vector PDF engine...',
    percent: 0,
    currentPage: 0,
    totalPages: total,
  });

  // Standard A4 in Points: 595.28 pt x 841.89 pt
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 24;
  const marginY = 24;
  const printableWidth = pageWidth - marginX * 2; // 547.28 pt
  const rightMarginX = pageWidth - marginX; // 571.28 pt

  const cols = config.resolvedColumns || 4;
  const gapX = 8;
  const cardW = (printableWidth - (cols - 1) * gapX) / cols;
  const cardH = 106;

  let globalCardIndex = 0;

  // Pre-calculate company logo natural dimensions to ensure crisp, undistorted contain-fit
  let logoDimensions = { width: 1, height: 1 };
  if (companyInfo.logoDataUrl && companyInfo.logoDataUrl.startsWith('data:image')) {
    try {
      logoDimensions = await getImageDimensionsFromDataUrl(companyInfo.logoDataUrl);
    } catch {
      logoDimensions = { width: 1, height: 1 };
    }
  }

  for (let i = 0; i < total; i++) {
    if (cancellationToken?.aborted) {
      throw new Error('PDF generation was cancelled.');
    }

    const pageNum = i + 1;

    onProgress?.({
      step: `Drawing vector Page ${pageNum} of ${total}`,
      percent: Math.round(((i) / total) * 100),
      currentPage: pageNum,
      totalPages: total,
    });

    if (i > 0) {
      doc.addPage();
    }

    const page = pages[i];
    let currentY = marginY;

    // ==========================================
    // 1. COMPANY HEADER
    // ==========================================
    if (i === 0) {
      // First Page: Full Company Header with enlarged, proportioned logo box
      const maxLogoBoxW = 75; // Expanded horizontal bounding box for wide pharmaceutical logos
      const maxLogoBoxH = 44; // ~1.5x larger visual presence, keeping header vertically compact
      let hasValidLogo = false;
      let logoAreaSpan = 0;

      if (companyInfo.logoDataUrl && companyInfo.logoDataUrl.startsWith('data:image')) {
        try {
          const origW = logoDimensions.width || 1;
          const origH = logoDimensions.height || 1;
          const aspect = origW / origH;

          let drawW: number;
          let drawH: number;

          // Pure contain-fit: always preserves original aspect ratio, never stretches or squeezes
          if (aspect >= maxLogoBoxW / maxLogoBoxH) {
            drawW = maxLogoBoxW;
            drawH = drawW / aspect;
          } else {
            drawH = maxLogoBoxH;
            drawW = drawH * aspect;
          }

          // Center horizontally and vertically within the dedicated logo bounding box
          const logoX = marginX + (maxLogoBoxW - drawW) / 2;
          const logoY = currentY + (maxLogoBoxH - drawH) / 2;

          const imgFormat =
            companyInfo.logoDataUrl.includes('image/jpeg') ||
            companyInfo.logoDataUrl.includes('image/jpg')
              ? 'JPEG'
              : 'PNG';

          doc.addImage(companyInfo.logoDataUrl, imgFormat, logoX, logoY, drawW, drawH);
          hasValidLogo = true;
          logoAreaSpan = maxLogoBoxW + 12; // Logo box width + breathing room to company title
        } catch {
          hasValidLogo = false;
          logoAreaSpan = 0;
        }
      }

      // Left: Company Name & Subtitle Lockup (Positioned to the right of the logo box)
      const companyTextX = marginX + logoAreaSpan;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13.5);
      doc.setTextColor('#111111');
      doc.text(
        companyInfo.businessName || 'Apex Pharma Laboratories Ltd.',
        companyTextX,
        hasValidLogo ? currentY + 18 : currentY + 14
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor('#263238');
      doc.text(
        'PHARMACEUTICAL PRODUCT CATALOGUE',
        companyTextX,
        hasValidLogo ? currentY + 30 : currentY + 26
      );

      // Right: Phone & Email
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor('#37474F');
      const contactInfo = [companyInfo.phone, companyInfo.email].filter(Boolean).join('  •  ');
      if (contactInfo) {
        doc.text(contactInfo, rightMarginX, currentY + 11, { align: 'right' });
      }

      // Right: Complete Multi-Line Address (Never truncated)
      let addressBottom = currentY + 14;
      if (companyInfo.address) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor('#455A64');
        const addrLines = doc.splitTextToSize(companyInfo.address, 220);
        addrLines.forEach((line: string, lIdx: number) => {
          doc.text(line, rightMarginX, currentY + 23 + lIdx * 10, { align: 'right' });
        });
        addressBottom = currentY + 23 + addrLines.length * 10;
      }

      const headerBottomY = hasValidLogo
        ? Math.max(currentY + maxLogoBoxH + 4, addressBottom + 4)
        : Math.max(currentY + 38, addressBottom + 4);

      doc.setDrawColor('#EEEEEE');
      doc.setLineWidth(1);
      doc.line(marginX, headerBottomY, rightMarginX, headerBottomY);

      currentY = headerBottomY + 10;
    } else {
      // Subsequent Pages: Compact Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor('#263238');
      doc.text('PRODUCT CATALOGUE', marginX, currentY + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor('#78909C');
      doc.text('A4 PORTRAIT PRINT EDITION', rightMarginX, currentY + 8, { align: 'right' });

      currentY += 16;
      doc.setDrawColor('#EEEEEE');
      doc.setLineWidth(1);
      doc.line(marginX, currentY, rightMarginX, currentY);

      currentY += 10;
    }

    // ==========================================
    // 2. PAGE SECTIONS (DOSAGE, COMPOSITION, CARDS)
    // ==========================================
    for (const section of page.sections) {
      if (section.type === 'dosage_header' && section.dosageForm) {
        const bannerH = 24;
        doc.setFillColor('#009688');
        doc.setDrawColor('#00796B');
        doc.setLineWidth(1);
        doc.roundedRect(marginX, currentY, printableWidth, bannerH, 6, 6, 'FD');

        // White bullet dot
        doc.setFillColor('#FFFFFF');
        doc.circle(marginX + 14, currentY + 12, 3, 'F');

        // Dosage Category Title (No "DOSAGE CATEGORY" badge)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor('#FFFFFF');
        doc.text(section.dosageForm.toUpperCase(), marginX + 24, currentY + 15.5);

        currentY += bannerH + 7;
      } else if (section.type === 'composition_header' && section.composition) {
        const maxTextW = section.isContinuation ? printableWidth - 75 : printableWidth - 18;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        const compLines = doc.splitTextToSize(section.composition, maxTextW);
        const bannerH = compLines.length === 1 ? 20 : 28;

        doc.setFillColor('#FFD600');
        doc.setDrawColor('#E6C200');
        doc.setLineWidth(1);
        doc.roundedRect(marginX, currentY, printableWidth, bannerH, 4, 4, 'FD');

        // Composition text vertically centered as a block
        doc.setTextColor('#111111');
        const totalTextH = (compLines.length - 1) * 11 + 6.3;
        const textStartY = currentY + (bannerH - totalTextH) / 2 + 6.3;
        compLines.forEach((line: string, idx: number) => {
          doc.text(line, marginX + 8, textStartY + idx * 11);
        });

        // Continuation badge if section spans multiple pages
        if (section.isContinuation) {
          const badgeW = 54;
          const badgeH = 12;
          const badgeX = rightMarginX - 8 - badgeW;
          const badgeY = currentY + (bannerH - badgeH) / 2;

          doc.setFillColor('#FFF176');
          doc.setDrawColor('#FBC02D');
          doc.setLineWidth(0.8);
          doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor('#111111');
          doc.text('CONTINUED', badgeX + badgeW / 2, badgeY + 8.5, { align: 'center' });
        }

        currentY += bannerH + 7;
      } else if (section.type === 'card_row' && section.cards) {
        // Render each card in this row
        section.cards.forEach((card, cIdx) => {
          const cardX = marginX + cIdx * (cardW + gapX);
          const cardY = currentY;

          // Theme color resolution
          let cardPalette = PRINT_SAFE_PALETTE[globalCardIndex % PRINT_SAFE_PALETTE.length];
          if (config.theme === 'clinical') {
            cardPalette = { name: 'Clinical', bg: '#F1F5F9', border: '#CBD5E1', divider: '#CBD5E1' };
          } else if (config.theme === 'ocean') {
            cardPalette = { name: 'Ocean', bg: '#E0F2FE', border: '#7DD3FC', divider: '#7DD3FC' };
          } else if (config.theme === 'emerald') {
            cardPalette = { name: 'Emerald', bg: '#E8F5E9', border: '#A5D6A7', divider: '#A5D6A7' };
          } else if (config.theme === 'monochrome') {
            cardPalette = { name: 'Monochrome', bg: '#F5F5F5', border: '#D4D4D4', divider: '#D4D4D4' };
          }
          globalCardIndex++;

          // Card Background & Border
          doc.setFillColor(cardPalette.bg);
          doc.setDrawColor(cardPalette.border);
          doc.setLineWidth(1.2);
          doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, 'FD');

          // ===============================
          // Product Name (Centered & Bold)
          // ===============================
          const nameFontSize = cols === 5 ? 8.5 : cols === 4 ? 9.5 : 10.5;
          const nameLineHeight = cols === 5 ? 10.5 : cols === 4 ? 11.5 : 12.5;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(nameFontSize);
          doc.setTextColor('#111111');

          const nameLines = doc.splitTextToSize(card.productName, cardW - 12).slice(0, 2);
          const nameAreaH = 26;
          const capH = nameFontSize * 0.7;
          const totalNameH = (nameLines.length - 1) * nameLineHeight + capH;
          const nameStartY = cardY + 7 + (nameAreaH - totalNameH) / 2 + capH;

          nameLines.forEach((line: string, idx: number) => {
            doc.text(line, cardX + cardW / 2, nameStartY + idx * nameLineHeight, { align: 'center' });
          });

          // ===============================
          // Pack Size (Directly below Name)
          // ===============================
          const packFontSize = cols === 5 ? 7 : cols === 4 ? 7.5 : 8.5;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(packFontSize);
          doc.setTextColor('#263238');
          const packText = card.pack ? card.pack.toUpperCase() : '';
          doc.text(packText, cardX + cardW / 2, cardY + 40, { align: 'center', maxWidth: cardW - 12 });

          // ===============================
          // Horizontal Divider
          // ===============================
          doc.setDrawColor(cardPalette.divider);
          doc.setLineWidth(0.8);
          doc.line(cardX + 8, cardY + 47, cardX + cardW - 8, cardY + 47);

          // ===============================
          // Pricing Section (Two Columns)
          // ===============================
          const labelFontSize = cols === 5 ? 6 : cols === 4 ? 6.5 : 7.5;
          const priceFontSize = cols === 5 ? 7.5 : cols === 4 ? 8.5 : 9.5;

          // Labels
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(labelFontSize);
          doc.setTextColor('#37474F');
          doc.text('MRP', cardX + 8, cardY + 58);
          doc.text('PTR', cardX + cardW - 8, cardY + 58, { align: 'right' });

          // Values with standard PDF-safe "Rs." formatting
          drawPrice(doc, card.mrp, cardX + 8, cardY + 70, priceFontSize, '#111111', 'left');
          drawPrice(doc, card.ptr, cardX + cardW - 8, cardY + 70, priceFontSize, '#111111', 'right');

          // ===============================
          // Scheme Section (Simple Row)
          // ===============================
          doc.setDrawColor(cardPalette.divider);
          doc.setLineWidth(0.7);
          doc.setLineDashPattern([2, 2], 0);
          doc.line(cardX + 8, cardY + 78, cardX + cardW - 8, cardY + 78);
          doc.setLineDashPattern([], 0); // reset dash pattern

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(labelFontSize);
          doc.setTextColor('#37474F');
          doc.text('SCHEME', cardX + 8, cardY + 90);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(priceFontSize - 0.5);
          doc.setTextColor('#111111');
          doc.text(card.scheme || '—', cardX + cardW - 8, cardY + 90, {
            align: 'right',
            maxWidth: cardW * 0.55,
          });
        });

        currentY += cardH + 7;
      }
    }

    // ==========================================
    // 3. PAGE FOOTER
    // ==========================================
    doc.setDrawColor('#EEEEEE');
    doc.setLineWidth(1);
    doc.line(marginX, pageHeight - 27, rightMarginX, pageHeight - 27);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor('#78909C');
    doc.text('Pharmaceutical Product Catalogue • Trade & Clinical Reference', marginX, pageHeight - 15);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor('#37474F');
    doc.text(`Page ${pageNum} of ${total}`, rightMarginX, pageHeight - 15, { align: 'right' });

    // Yield control briefly to ensure UI remains fluid during PDF compilation
    await new Promise((resolve) => setTimeout(resolve, 5));
  }

  onProgress?.({
    step: 'Finalizing PDF document...',
    percent: 100,
    currentPage: total,
    totalPages: total,
  });

  // Generate output Blob and trigger direct browser download
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const pdfBlob = doc.output('blob');
    const safeName = (fileName || 'Product_Catalogue').replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalFilename = safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`;

    const blobUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = finalFilename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 30000);
  }
}
