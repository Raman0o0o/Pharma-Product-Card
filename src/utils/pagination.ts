import {
  GroupedDosageForm,
  ProductItem,
  CataloguePageData,
  PageSectionItem,
  GridColumns,
} from '../types';

/**
 * Resolves the optimal number of grid columns (3, 4, or 5)
 * based on product name lengths and overall text density.
 */
export function resolveGridColumns(
  products: ProductItem[],
  userPreference: GridColumns = 'auto'
): 3 | 4 | 5 {
  if (userPreference === 3 || userPreference === 4 || userPreference === 5) {
    return userPreference;
  }

  if (products.length === 0) return 4;

  let maxNameLen = 0;
  let totalNameLen = 0;

  for (const p of products) {
    const len = p.productName.length;
    if (len > maxNameLen) maxNameLen = len;
    totalNameLen += len;
  }

  const avgNameLen = totalNameLen / products.length;

  if (maxNameLen > 24 || avgNameLen > 17) {
    return 3;
  }

  if (maxNameLen <= 15 && avgNameLen <= 11) {
    return 5;
  }

  return 4;
}

/**
 * Height constants calibrated to standard A4 printable geometry (841.89 pt height):
 *
 * Page 1:
 * - Top margin (24 pt) + Full Company Header with multi-line address (~55 pt) = ~79 pt top
 * - Bottom margin + Footer reserve (~35 pt bottom)
 * -> Usable vertical space: 720 pt
 *
 * Page 2+:
 * - Top margin (24 pt) + Compact Header (~24 pt) = ~48 pt top
 * - Bottom margin + Footer reserve (~35 pt bottom)
 * -> Usable vertical space: 755 pt
 *
 * Section Heights:
 * - Dosage Form Header: 24 pt banner + 7 pt gap = 31 pt
 * - Composition Header (1 line): 20 pt banner + 7 pt gap = 27 pt
 * - Composition Header (2 lines): 28 pt banner + 7 pt gap = 35 pt
 * - Product Card Row: 106 pt card + 7 pt gap = 113 pt
 */
const PAGE_1_USABLE_HEIGHT = 720;
const PAGE_N_USABLE_HEIGHT = 755;

const HEIGHT_DOSAGE_HEADER = 31;
const HEIGHT_COMPOSITION_HEADER_1_LINE = 27;
const HEIGHT_COMPOSITION_HEADER_2_LINES = 35;
const HEIGHT_CARD_ROW = 113;

/**
 * Chunks array into complete rows of specified size
 */
function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Calculates page layout structure with dynamic, high-utilization pagination (80-95% space usage).
 *
 * Core Rules:
 * 1. Compositions and products flow naturally across pages without premature page breaks.
 * 2. Never leave a Composition heading alone at the bottom of a page.
 *    It must stay with at least ONE complete card row.
 * 3. Complete card rows are preserved (cards are never split across pages).
 * 4. A new Dosage Form section can start on the current page if it fits:
 *    Dosage Form Heading + First Composition Heading + At least ONE card row.
 *    Otherwise, it moves together to the next page.
 * 5. Generous vertical space utilization without shrinking cards or text.
 */
export function paginateCatalogue(
  groupedForms: GroupedDosageForm[],
  columns: 3 | 4 | 5,
  showContinuationHeaders: boolean = true
): CataloguePageData[] {
  const pages: CataloguePageData[] = [];

  let currentPageSections: PageSectionItem[] = [];
  let remainingHeight = PAGE_1_USABLE_HEIGHT;

  const pushCurrentPage = () => {
    if (currentPageSections.length > 0) {
      pages.push({
        pageNumber: pages.length + 1,
        totalPages: 1, // Will be updated at the end
        sections: [...currentPageSections],
      });
      currentPageSections = [];
      remainingHeight = PAGE_N_USABLE_HEIGHT;
    }
  };

  for (const formData of groupedForms) {
    const dosageName = formData.normalizedForm;

    for (let compIndex = 0; compIndex < formData.compositions.length; compIndex++) {
      const compData = formData.compositions[compIndex];
      const compName = compData.displayHeading;
      const cardRows = chunkArray(compData.products, columns);

      // Estimate composition header height based on text length
      const compHeaderH =
        compName.length > 55
          ? HEIGHT_COMPOSITION_HEADER_2_LINES
          : HEIGHT_COMPOSITION_HEADER_1_LINE;

      // Check whether dosage header is already present on the current page
      const isDosageAlreadyOnPage = currentPageSections.some(
        (s) => s.type === 'dosage_header' && s.dosageForm === dosageName
      );
      const neededForDosage = isDosageAlreadyOnPage ? 0 : HEIGHT_DOSAGE_HEADER;

      // Minimum space required to start this composition on the current page:
      // Must accommodate: (Dosage header if needed) + Composition header + at least 1 card row
      const minRequiredToStart = neededForDosage + compHeaderH + HEIGHT_CARD_ROW;

      if (remainingHeight < minRequiredToStart) {
        pushCurrentPage();
      }

      // Ensure dosage header is present on the page where this dosage form starts
      const hasDosageNow = currentPageSections.some(
        (s) => s.type === 'dosage_header' && s.dosageForm === dosageName
      );
      if (!hasDosageNow) {
        currentPageSections.push({
          type: 'dosage_header',
          dosageForm: dosageName,
        });
        remainingHeight -= HEIGHT_DOSAGE_HEADER;
      }

      // Add Composition Header
      currentPageSections.push({
        type: 'composition_header',
        dosageForm: dosageName,
        composition: compName,
        isContinuation: false,
      });
      remainingHeight -= compHeaderH;

      // Place card rows for this composition
      for (let rIndex = 0; rIndex < cardRows.length; rIndex++) {
        const row = cardRows[rIndex];

        // For row 0, we already guaranteed it fits via minRequiredToStart.
        // For row 1+, check if it fits in the remaining space of the current page.
        if (rIndex > 0 && remainingHeight < HEIGHT_CARD_ROW) {
          pushCurrentPage();

          // On continuation page, add context header if requested
          if (showContinuationHeaders) {
            currentPageSections.push({
              type: 'composition_header',
              dosageForm: dosageName,
              composition: compName,
              isContinuation: true,
            });
            remainingHeight -= HEIGHT_COMPOSITION_HEADER_1_LINE;
          }
        }

        currentPageSections.push({
          type: 'card_row',
          cards: row,
          rowCardsCount: columns,
        });
        remainingHeight -= HEIGHT_CARD_ROW;
      }
    }
  }

  // Push final page
  pushCurrentPage();

  // If no products exist, provide one blank page
  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      totalPages: 1,
      sections: [],
    });
  }

  // Update totalPages count across all pages
  const total = pages.length;
  pages.forEach((p) => {
    p.totalPages = total;
  });

  return pages;
}
