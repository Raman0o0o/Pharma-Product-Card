import { ProductItem, GroupedComposition, GroupedDosageForm } from '../types';

/**
 * Normalizes a pharmaceutical composition string for grouping purposes only.
 * Ignores harmless differences like & vs +, extra spaces, casing, and unit spacing.
 */
export function normalizeCompositionKey(comp: string): string {
  if (!comp) return '';

  return comp
    .toLowerCase()
    // Replace synonyms and conjunctions with +
    .replace(/\s+(&|\band\b|\bwith\b)\s+/gi, '+')
    .replace(/&/g, '+')
    // Remove space between number and unit: 100 mg -> 100mg, 500 ml -> 500ml
    .replace(/(\d+)\s*(mg|mcg|gm|g|ml|iu|u|w\/v|w\/w|v\/v)\b/gi, '$1$2')
    // Remove space around mathematical / separator operators
    .replace(/\s*([+/,:\-])\s*/g, '$1')
    // Collapse any remaining whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Groups product items by Dosage Form, then by Composition,
 * strictly preserving the original Excel row order.
 */
export function groupProducts(products: ProductItem[]): GroupedDosageForm[] {
  // Ordered list of dosage forms as they appear in the Excel rows
  const dosageFormOrder: string[] = [];
  // Map of dosageForm -> map of normalizedCompKey -> GroupedComposition
  const formMap = new Map<string, {
    order: string[]; // preserves composition first appearance order
    compMap: Map<string, GroupedComposition>;
  }>();

  for (const product of products) {
    const form = product.dosageForm || 'OTHER';
    const normKey = normalizeCompositionKey(product.composition);

    if (!formMap.has(form)) {
      dosageFormOrder.push(form);
      formMap.set(form, {
        order: [],
        compMap: new Map(),
      });
    }

    const currentForm = formMap.get(form)!;

    if (!currentForm.compMap.has(normKey)) {
      currentForm.order.push(normKey);
      currentForm.compMap.set(normKey, {
        normalizedKey: normKey,
        displayHeading: product.composition.trim(), // Keep first encountered original casing & wording
        dosageForm: form,
        products: [],
      });
    }

    const currentComp = currentForm.compMap.get(normKey)!;
    currentComp.products.push(product);
  }

  // Construct final grouped structure in preserved order
  const result: GroupedDosageForm[] = [];

  for (const formName of dosageFormOrder) {
    const formData = formMap.get(formName)!;
    const compositions: GroupedComposition[] = [];
    let totalCount = 0;

    for (const compKey of formData.order) {
      const comp = formData.compMap.get(compKey)!;
      compositions.push(comp);
      totalCount += comp.products.length;
    }

    result.push({
      normalizedForm: formName,
      compositions,
      totalProducts: totalCount,
    });
  }

  return result;
}
