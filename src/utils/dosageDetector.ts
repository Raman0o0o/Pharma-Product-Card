/**
 * Dosage Form Detection and Normalization System
 * Follows pharmaceutical standard guidelines
 */

// Normalized target standard forms
export const STANDARD_DOSAGE_FORMS = [
  'TABLETS',
  'CAPSULES',
  'SYRUPS',
  'SUSPENSIONS',
  'DRY SYRUPS',
  'INJECTIONS',
  'DROPS',
  'EYE DROPS',
  'EAR DROPS',
  'EYE/EAR DROPS',
  'OINTMENTS',
  'CREAMS',
  'GELS',
  'POWDERS',
  'SACHETS',
  'SPRAYS',
  'OILS',
  'LOTIONS',
  'MOUTHWASH',
  'SOLUTIONS',
  'SOAPS',
  'SHAMPOOS',
  'PATCHES',
  'SUPPOSITORIES',
  'OTHER',
] as const;

export type StandardDosageForm = typeof STANDARD_DOSAGE_FORMS[number];

/**
 * Normalizes an explicit dosage form string to standard canonical pharmaceutical dosage form
 */
export function normalizeDosageForm(rawForm: string): StandardDosageForm {
  if (!rawForm || typeof rawForm !== 'string') {
    return 'OTHER';
  }

  const clean = rawForm.trim().toUpperCase();

  // Dry Syrups (check before Syrup)
  if (
    clean.includes('DRY SYRUP') ||
    clean.includes('DRY SYP') ||
    clean.includes('D/S') ||
    clean.includes('DRY SUSPENSION') ||
    clean === 'DS'
  ) {
    return 'DRY SYRUPS';
  }

  // Eye/Ear Drops
  if (
    clean.includes('EYE/EAR') ||
    clean.includes('EYE & EAR') ||
    clean.includes('OPHTHALMIC & OTIC') ||
    clean.includes('E/E')
  ) {
    return 'EYE/EAR DROPS';
  }

  // Eye Drops
  if (
    clean.includes('EYE DROP') ||
    clean.includes('OPHTHALMIC') ||
    clean === 'ED'
  ) {
    return 'EYE DROPS';
  }

  // Ear Drops
  if (
    clean.includes('EAR DROP') ||
    clean.includes('OTIC')
  ) {
    return 'EAR DROPS';
  }

  // Drops
  if (
    clean.includes('DROP') ||
    clean.includes('DROPS') ||
    clean.includes('ORAL DROP')
  ) {
    return 'DROPS';
  }

  // Tablets
  if (
    clean === 'TAB' ||
    clean === 'TABS' ||
    clean === 'TABLET' ||
    clean === 'TABLETS' ||
    clean.includes('TABLET') ||
    clean.includes('CAPLET') ||
    clean === 'DT' ||
    clean === 'MD' ||
    clean.includes('CHEWABLE') ||
    clean.includes('EFFERVESCENT')
  ) {
    return 'TABLETS';
  }

  // Capsules
  if (
    clean === 'CAP' ||
    clean === 'CAPS' ||
    clean === 'CAPSULE' ||
    clean === 'CAPSULES' ||
    clean.includes('CAPSULE') ||
    clean.includes('SOFTGEL') ||
    clean.includes('SOFT GEL') ||
    clean.includes('GELATIN')
  ) {
    return 'CAPSULES';
  }

  // Injections
  if (
    clean === 'INJ' ||
    clean === 'INJS' ||
    clean === 'INJECTION' ||
    clean === 'INJECTIONS' ||
    clean.includes('INJECTION') ||
    clean.includes('VIAL') ||
    clean.includes('AMPOULE') ||
    clean.includes('AMP') ||
    clean.includes('INFUSION') ||
    clean === 'IV'
  ) {
    return 'INJECTIONS';
  }

  // Suspensions (check before Syrup)
  if (
    clean === 'SUSP' ||
    clean === 'SUSPENSION' ||
    clean === 'SUSPENSIONS' ||
    clean.includes('SUSPENSION')
  ) {
    return 'SUSPENSIONS';
  }

  // Syrups
  if (
    clean === 'SYRUP' ||
    clean === 'SYRUPS' ||
    clean === 'SYP' ||
    clean.includes('SYRUP') ||
    clean.includes('LIQUID ORAL')
  ) {
    return 'SYRUPS';
  }

  // Ointments
  if (
    clean === 'OINT' ||
    clean === 'OINTMENT' ||
    clean === 'OINTMENTS' ||
    clean.includes('OINTMENT')
  ) {
    return 'OINTMENTS';
  }

  // Creams
  if (
    clean === 'CREAM' ||
    clean === 'CREAMS' ||
    clean === 'CRM' ||
    clean.includes('CREAM')
  ) {
    return 'CREAMS';
  }

  // Gels
  if (
    clean === 'GEL' ||
    clean === 'GELS' ||
    clean.includes('GEL')
  ) {
    return 'GELS';
  }

  // Powders
  if (
    clean === 'POWDER' ||
    clean === 'POWDERS' ||
    clean.includes('POWDER') ||
    clean.includes('DUSTING')
  ) {
    return 'POWDERS';
  }

  // Sachets
  if (
    clean === 'SACHET' ||
    clean === 'SACHETS' ||
    clean.includes('SACHET') ||
    clean.includes('GRANULES')
  ) {
    return 'SACHETS';
  }

  // Sprays
  if (
    clean === 'SPRAY' ||
    clean === 'SPRAYS' ||
    clean.includes('SPRAY') ||
    clean.includes('NASAL')
  ) {
    return 'SPRAYS';
  }

  // Oils
  if (
    clean === 'OIL' ||
    clean === 'OILS' ||
    clean.includes('OIL')
  ) {
    return 'OILS';
  }

  // Lotions
  if (
    clean === 'LOTION' ||
    clean === 'LOTIONS' ||
    clean.includes('LOTION')
  ) {
    return 'LOTIONS';
  }

  // Mouthwash
  if (
    clean.includes('MOUTHWASH') ||
    clean.includes('GARGLE') ||
    clean.includes('ORAL RINSE')
  ) {
    return 'MOUTHWASH';
  }

  // Solutions
  if (
    clean === 'SOLUTION' ||
    clean === 'SOLUTIONS' ||
    clean === 'SOLN' ||
    clean.includes('SOLUTION')
  ) {
    return 'SOLUTIONS';
  }

  // Soaps
  if (
    clean === 'SOAP' ||
    clean === 'SOAPS' ||
    clean.includes('SOAP') ||
    clean.includes('BATHING BAR')
  ) {
    return 'SOAPS';
  }

  // Shampoos
  if (
    clean === 'SHAMPOO' ||
    clean === 'SHAMPOOS' ||
    clean.includes('SHAMPOO')
  ) {
    return 'SHAMPOOS';
  }

  // Patches
  if (
    clean === 'PATCH' ||
    clean === 'PATCHES' ||
    clean.includes('PATCH') ||
    clean.includes('TRANSDERMAL')
  ) {
    return 'PATCHES';
  }

  // Suppositories
  if (
    clean.includes('SUPPOSITORY') ||
    clean.includes('SUPPOSITORIES') ||
    clean.includes('PESSARY') ||
    clean.includes('PESSARIES')
  ) {
    return 'SUPPOSITORIES';
  }

  return 'OTHER';
}

/**
 * Automatically detects the dosage form from available product strings
 * (Product Name, Pack Size, Composition) when explicit column is missing or blank.
 */
export function detectDosageForm(
  productName: string = '',
  pack: string = '',
  composition: string = ''
): StandardDosageForm {
  const combined = `${productName} ${pack} ${composition}`.toUpperCase();

  // Pattern detection with word boundary precision

  // 1. Dry Syrups (prioritized before syrups)
  if (
    /\b(DRY\s*SYRUP|DRY\s*SYP|D\/S|FOR\s+ORAL\s+SUSPENSION)\b/i.test(combined) ||
    /(\bWFI\b.*(DRY|SYRUP))/i.test(combined)
  ) {
    return 'DRY SYRUPS';
  }

  // 2. Eye/Ear Drops
  if (
    /\b(EYE\/EAR|EYE\s*&\s*EAR|E\/E)\s*(DROPS?|SOLN|SOLUTION)?\b/i.test(combined) ||
    /\bOPHTHALMIC\s*(&|\/)\s*OTIC\b/i.test(combined)
  ) {
    return 'EYE/EAR DROPS';
  }

  // 3. Eye Drops
  if (
    /\b(EYE\s*DROPS?|OPHTHALMIC\s*(SOLUTION|SOLN|SUSPENSION)?)\b/i.test(combined) ||
    /\b(E\/D)\b/i.test(productName)
  ) {
    return 'EYE DROPS';
  }

  // 4. Ear Drops
  if (
    /\b(EAR\s*DROPS?|OTIC\s*(SOLUTION|SOLN)?)\b/i.test(combined)
  ) {
    return 'EAR DROPS';
  }

  // 5. Injections
  if (
    /\b(INJ|INJECTION|INJECTIONS|VIAL|AMPOULE|AMP|INFUSION|I\.V\.|IV|I\.M\.|IM)\b/i.test(productName) ||
    /\b(VIAL|AMPOULE|AMP|WITH\s+WFI|STERILE\s+WATER)\b/i.test(pack) ||
    /\b(INJECTION|INFUSION)\b/i.test(composition)
  ) {
    return 'INJECTIONS';
  }

  // 6. Capsules
  if (
    /\b(CAP|CAPS|CAPSULE|CAPSULES|SOFTGEL|SOFTGELS|SOFT\s*GEL)\b/i.test(productName) ||
    /\b(CAP|CAPS|CAPSULES)\b/i.test(pack) ||
    /\b(CAPSULE|CAPSULES)\b/i.test(composition)
  ) {
    return 'CAPSULES';
  }

  // 7. Tablets
  if (
    /\b(TAB|TABS|TABLET|TABLETS|DT|MD|DISPERSIBLE|CHEWABLE|EFFERVESCENT)\b/i.test(productName) ||
    /\b(TAB|TABS|TABLET|TABLETS|BLISTER|ALU-ALU|STRIP)\b/i.test(pack) ||
    /\b(TABLET|TABLETS)\b/i.test(composition)
  ) {
    return 'TABLETS';
  }

  // 8. Suspensions
  if (
    /\b(SUSP|SUSPENSION|SUSPENSIONS)\b/i.test(combined)
  ) {
    return 'SUSPENSIONS';
  }

  // 9. Syrups
  if (
    /\b(SYRUP|SYRUPS|SYP)\b/i.test(productName) ||
    /\b(SYRUP|SYRUPS|SYP)\b/i.test(composition) ||
    /\b(PET\s*BOTTLE\s*WITH\s*BOX|BOTTLE)\b/i.test(pack) && /\b(ML)\b/i.test(pack)
  ) {
    return 'SYRUPS';
  }

  // 10. Drops (Pediatric/Oral)
  if (
    /\b(DROPS?|ORAL\s*DROPS?)\b/i.test(combined) ||
    /\b(DROPPER)\b/i.test(pack)
  ) {
    return 'DROPS';
  }

  // 11. Ointments
  if (
    /\b(OINT|OINTMENT|OINTMENTS)\b/i.test(combined)
  ) {
    return 'OINTMENTS';
  }

  // 12. Creams
  if (
    /\b(CREAM|CREAMS|CRM)\b/i.test(combined)
  ) {
    return 'CREAMS';
  }

  // 13. Gels
  if (
    /\b(GEL|GELS)\b/i.test(combined)
  ) {
    return 'GELS';
  }

  // 14. Powders
  if (
    /\b(POWDER|POWDERS|DUSTING\s*POWDER)\b/i.test(combined)
  ) {
    return 'POWDERS';
  }

  // 15. Sachets
  if (
    /\b(SACHET|SACHETS|GRANULES)\b/i.test(combined)
  ) {
    return 'SACHETS';
  }

  // 16. Sprays
  if (
    /\b(SPRAY|SPRAYS|NASAL\s*SPRAY)\b/i.test(combined)
  ) {
    return 'SPRAYS';
  }

  // 17. Mouthwash / Gargle
  if (
    /\b(MOUTHWASH|GARGLE|ORAL\s*RINSE)\b/i.test(combined)
  ) {
    return 'MOUTHWASH';
  }

  // 18. Lotions
  if (
    /\b(LOTION|LOTIONS)\b/i.test(combined)
  ) {
    return 'LOTIONS';
  }

  // 19. Oils
  if (
    /\b(OIL|OILS|MEDICATED\s*OIL)\b/i.test(combined)
  ) {
    return 'OILS';
  }

  // 20. Soaps
  if (
    /\b(SOAP|SOAPS|BATHING\s*BAR)\b/i.test(combined)
  ) {
    return 'SOAPS';
  }

  // 21. Shampoos
  if (
    /\b(SHAMPOO|SHAMPOOS)\b/i.test(combined)
  ) {
    return 'SHAMPOOS';
  }

  // 22. Patches
  if (
    /\b(PATCH|PATCHES|TRANSDERMAL)\b/i.test(combined)
  ) {
    return 'PATCHES';
  }

  // 23. Suppositories
  if (
    /\b(SUPPOSITORY|SUPPOSITORIES|PESSARY|PESSARIES)\b/i.test(combined)
  ) {
    return 'SUPPOSITORIES';
  }

  // 24. Solutions
  if (
    /\b(SOLUTION|SOLUTIONS|SOLN)\b/i.test(combined)
  ) {
    return 'SOLUTIONS';
  }

  // Fallback: If not confident, return OTHER
  return 'OTHER';
}

/**
 * Resolves the final dosage form for a product row:
 * Explicit value has highest priority. If missing/blank, falls back to automatic detection.
 */
export function resolveDosageForm(
  explicitForm?: string,
  productName: string = '',
  pack: string = '',
  composition: string = ''
): StandardDosageForm {
  if (explicitForm && explicitForm.trim().length > 0) {
    return normalizeDosageForm(explicitForm);
  }

  return detectDosageForm(productName, pack, composition);
}
