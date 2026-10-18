import { ProductItem } from '../types';
import { resolveDosageForm } from '../utils/dosageDetector';
import { groupProducts } from '../utils/grouping';
import { paginateCatalogue } from '../utils/pagination';

export interface DemoItem {
  dosageForm?: string;
  composition: string;
  productName: string;
  pack: string;
  mrp: string;
  ptr: string;
  scheme: string;
}

export const SAMPLE_PRODUCTS_DATA: DemoItem[] = [
  // 1. Tablets - Aceclofenac + Paracetamol
  {
    dosageForm: 'Tablets',
    composition: 'Aceclofenac 100 MG & Paracetamol 325 MG',
    productName: 'ACEVIX-P TAB',
    pack: '10×10 BLISTER',
    mrp: 'Rs. 62.81',
    ptr: 'Rs. 47.86',
    scheme: '10+10',
  },
  {
    dosageForm: 'Tablets',
    composition: 'Aceclofenac 100 MG & Paracetamol 325 MG',
    productName: 'ACKLOHIT-P',
    pack: '10×10 (BLISTER)',
    mrp: 'Rs. 76',
    ptr: 'Rs. 60.35',
    scheme: '1+1 OFFER',
  },
  {
    dosageForm: 'Tablets',
    composition: 'Aceclofenac 100 MG & Paracetamol 325 MG',
    productName: 'ACLANCe-P',
    pack: '10×10 (BLISTER)',
    mrp: 'Rs. 760',
    ptr: 'Rs. 579.05',
    scheme: '10+10',
  },
  {
    dosageForm: 'Tablets',
    composition: 'Aceclofenac 100 MG & Paracetamol 325 MG',
    productName: 'ACEVION-P TAB',
    pack: '10×10 BLISTER',
    mrp: 'Rs. 72.00',
    ptr: 'Rs. 45.00',
    scheme: '10+5',
  },
  {
    dosageForm: 'Tablets',
    composition: 'Aceclofenac 100 MG & Paracetamol 325 MG & Serratiopeptidase 15 MG', // Testing multi-line long composition
    productName: 'ACEVLO-PRIME FORTE TABLETS',
    pack: '10×10 ALU-ALU',
    mrp: 'Rs. 84.00',
    ptr: 'Rs. 63.80',
    scheme: '10+1',
  },

  // 2. Tablets - Azithromycin
  {
    dosageForm: 'Tablets',
    composition: 'Azithromycin 500 MG',
    productName: 'AZIKEM 500 TAB',
    pack: '1×3 BLISTER',
    mrp: 'Rs. 71.50',
    ptr: 'Rs. 54.20',
    scheme: '10+2',
  },
  {
    dosageForm: 'Tablets',
    composition: 'Azithromycin 500 MG',
    productName: 'AZIFINE 500 TAB',
    pack: '1×5 STRIP',
    mrp: 'Rs. 118.00',
    ptr: 'Rs. 89.50',
    scheme: '',
  },
  {
    dosageForm: 'Tablets',
    composition: 'Azithromycin 500 MG',
    productName: 'AZILIFE-500 TAB',
    pack: '1×3 BLISTER',
    mrp: 'Rs. 69.00',
    ptr: 'Rs. 52.00',
    scheme: '10+1',
  },
  {
    dosageForm: 'Tablets',
    composition: 'Azithromycin 500 MG',
    productName: 'AZICARE FORTE',
    pack: '1×6 ALU-ALU',
    mrp: 'Rs. 139.00',
    ptr: 'Rs. 105.00',
    scheme: '10+2',
  },

  // 3. Tablets - Blank dosage form to test auto-detection
  {
    dosageForm: '', // Blank
    composition: 'Telmisartan 40 MG + Amlodipine 5 MG',
    productName: 'TELMA-AM TAB',
    pack: '10×10 ALU-ALU',
    mrp: 'Rs. 145.00',
    ptr: 'Rs. 110.00',
    scheme: '10+1',
  },
  {
    dosageForm: '', // Blank
    composition: 'Telmisartan 40 MG + Amlodipine 5 MG',
    productName: 'TELMIZ-AM TABLET',
    pack: '10×10 ALU-ALU',
    mrp: 'Rs. 152.00',
    ptr: 'Rs. 115.50',
    scheme: '10+2',
  },
  {
    dosageForm: '', // Blank
    composition: 'Telmisartan 40 MG + Amlodipine 5 MG + Hydrochlorothiazide 12.5 MG',
    productName: 'TELMA-TRIO 40/5/12.5 TAB',
    pack: '10×10 ALU-ALU',
    mrp: 'Rs. 185.00',
    ptr: 'Rs. 140.00',
    scheme: '10+1',
  },

  // 4. Capsules - Omeprazole + Domperidone
  {
    dosageForm: 'Capsules',
    composition: 'Omeprazole 20 MG & Domperidone 10 MG',
    productName: 'OMECIP-D CAPS',
    pack: '10×10 STRIP',
    mrp: 'Rs. 68.50',
    ptr: 'Rs. 52.00',
    scheme: '10+5',
  },
  {
    dosageForm: 'Capsules',
    composition: 'Omeprazole 20 MG & Domperidone 10 MG',
    productName: 'OMEE-D CAPS',
    pack: '10×10 ALU-ALU',
    mrp: 'Rs. 84.00',
    ptr: 'Rs. 63.80',
    scheme: '10+10',
  },
  {
    dosageForm: 'Capsules',
    composition: 'Omeprazole 20 MG & Domperidone 10 MG',
    productName: 'OMPREZ-D SR CAPS',
    pack: '10×10 STRIP',
    mrp: 'Rs. 75.00',
    ptr: 'Rs. 57.00',
    scheme: '10+2',
  },

  // 5. Capsules - Long complex composition
  {
    dosageForm: 'Capsules',
    composition: 'Carbonyl Iron 100 MG + Folic Acid 1.5 MG + Vitamin B12 15 MCG + Zinc Sulphate 61.8 MG',
    productName: 'FERROFE-Z CAPSULES',
    pack: '10×10 BLISTER',
    mrp: 'Rs. 125.00',
    ptr: 'Rs. 95.00',
    scheme: '10+2',
  },
  {
    dosageForm: 'Capsules',
    composition: 'Carbonyl Iron 100 MG + Folic Acid 1.5 MG + Vitamin B12 15 MCG + Zinc Sulphate 61.8 MG',
    productName: 'HAEMOGLOB-XT SOFTGEL',
    pack: '3×10 BLISTER',
    mrp: 'Rs. 165.00',
    ptr: 'Rs. 125.40',
    scheme: '5+1',
  },

  // 6. Syrups
  {
    dosageForm: 'Syrups',
    composition: 'Terbutaline 1.25 MG + Bromhexine 4 MG + Guaiphenesin 50 MG + Menthol 2.5 MG',
    productName: 'KOFREST SYRUP',
    pack: '100 ML BOTTLE',
    mrp: 'Rs. 88.00',
    ptr: 'Rs. 66.80',
    scheme: '10+2',
  },
  {
    dosageForm: 'Syrups',
    composition: 'Terbutaline 1.25 MG + Bromhexine 4 MG + Guaiphenesin 50 MG + Menthol 2.5 MG',
    productName: 'COFLIN EXPECTORANT',
    pack: '100 ML PET BOTTLE',
    mrp: 'Rs. 92.50',
    ptr: 'Rs. 70.30',
    scheme: '10+3',
  },
  {
    dosageForm: 'Syrups',
    composition: 'Terbutaline 1.25 MG + Bromhexine 4 MG + Guaiphenesin 50 MG + Menthol 2.5 MG',
    productName: 'RESPIRA-T SYRUP',
    pack: '100 ML BOTTLE WITH CUP',
    mrp: 'Rs. 85.00',
    ptr: 'Rs. 64.50',
    scheme: '10+1',
  },
  {
    dosageForm: 'Syrups',
    composition: 'Ayurvedic Liver Support Formula with Silymarin, Kalmegh, Bhringraj & Punarnava',
    productName: 'LIVCARE FORTE SYRUP',
    pack: '200 ML PET BOTTLE',
    mrp: 'Rs. 140.00',
    ptr: 'Rs. 105.00',
    scheme: '10+2',
  },
  {
    dosageForm: 'Syrups',
    composition: 'Ayurvedic Liver Support Formula with Silymarin, Kalmegh, Bhringraj & Punarnava',
    productName: 'HEPATOFINE SYRUP',
    pack: '200 ML BOTTLE',
    mrp: 'Rs. 135.00',
    ptr: 'Rs. 99.00',
    scheme: '10+5',
  },

  // 7. Dry Syrups (Auto-detection test)
  {
    dosageForm: '', // Blank - should auto-detect as DRY SYRUPS
    composition: 'Amoxicillin 200 MG + Potassium Clavulanate 28.5 MG / 5 ML',
    productName: 'MOXIKIND-CV DRY SYRUP',
    pack: '30 ML WITH WFI',
    mrp: 'Rs. 65.20',
    ptr: 'Rs. 49.50',
    scheme: '10+1',
  },
  {
    dosageForm: '', // Blank
    composition: 'Amoxicillin 200 MG + Potassium Clavulanate 28.5 MG / 5 ML',
    productName: 'CLAVUPEN-DUO D/S',
    pack: '30 ML WITH STERILE WATER',
    mrp: 'Rs. 68.00',
    ptr: 'Rs. 51.50',
    scheme: '10+2',
  },

  // 8. Injections
  {
    dosageForm: 'Injections',
    composition: 'Ceftriaxone 1000 MG',
    productName: 'CEFTRI-1G INJ',
    pack: '1 VIAL WITH WFI',
    mrp: 'Rs. 59.00',
    ptr: 'Rs. 44.80',
    scheme: '10+5',
  },
  {
    dosageForm: 'Injections',
    composition: 'Ceftriaxone 1000 MG',
    productName: 'MONOZONE 1000 INJ',
    pack: '1 VIAL WITH TRAY',
    mrp: 'Rs. 64.00',
    ptr: 'Rs. 48.60',
    scheme: '10+10',
  },
  {
    dosageForm: 'Injections',
    composition: 'Pantoprazole 40 MG',
    productName: 'PANTO-40 INJ',
    pack: '1 VIAL WITH BOX',
    mrp: 'Rs. 52.50',
    ptr: 'Rs. 39.90',
    scheme: '10+10',
  },
  {
    dosageForm: 'Injections',
    composition: 'Pantoprazole 40 MG',
    productName: 'PROTOLOC-40 INJ',
    pack: '1 VIAL WITH WFI',
    mrp: 'Rs. 55.00',
    ptr: 'Rs. 41.80',
    scheme: '10+2',
  },

  // 9. Ointments & Creams & Gels (Auto-detection test)
  {
    dosageForm: '', // Blank - should auto-detect OINTMENTS
    composition: 'Clobetasol Propionate 0.05% + Neomycin Sulphate 0.5% + Miconazole Nitrate 2.0%',
    productName: 'CLOBE-GM OINTMENT',
    pack: '15 GM TUBE',
    mrp: 'Rs. 65.00',
    ptr: 'Rs. 49.40',
    scheme: '10+2',
  },
  {
    dosageForm: '', // Blank - should auto-detect GELS
    composition: 'Diclofenac Diethylamine 1.16% + Linseed Oil 3% + Methyl Salicylate 10% + Menthol 5%',
    productName: 'VOLTA-GEL PAIN RELIEF',
    pack: '30 GM LAMI TUBE',
    mrp: 'Rs. 95.00',
    ptr: 'Rs. 72.20',
    scheme: '10+3',
  },

  // 10. Eye Drops (Auto-detection test)
  {
    dosageForm: '', // Blank - should auto-detect EYE DROPS
    composition: 'Carboxymethylcellulose Sodium 0.5% w/v',
    productName: 'TEARS-REFRESH EYE DROPS',
    pack: '10 ML VIAL',
    mrp: 'Rs. 120.00',
    ptr: 'Rs. 91.20',
    scheme: '10+2',
  },
  {
    dosageForm: '', // Blank
    composition: 'Carboxymethylcellulose Sodium 0.5% w/v',
    productName: 'AQUA-LUB EYE DROPS',
    pack: '10 ML DROPPER BOTTLE',
    mrp: 'Rs. 128.00',
    ptr: 'Rs. 97.00',
    scheme: '10+1',
  },
];

export function getSampleProductItems(): ProductItem[] {
  return SAMPLE_PRODUCTS_DATA.map((item, index) => ({
    id: `sample-${index}`,
    productName: item.productName,
    pack: item.pack,
    mrp: item.mrp,
    ptr: item.ptr,
    scheme: item.scheme,
    dosageForm: resolveDosageForm(item.dosageForm, item.productName, item.pack, item.composition),
    composition: item.composition,
    originalRowIndex: index + 2,
  }));
}

export function getSampleGroupedData() {
  const products = getSampleProductItems();
  return {
    products,
    groupedDosageForms: groupProducts(products),
    totalProducts: products.length,
  };
}

/**
 * Generates a calibrated dataset that produces the exact target page count (10, 50, 100, 160 pages)
 * to verify incremental PDF generation at large scale without memory issues.
 */
export function getScaledSampleData(targetPages: number) {
  const baseItems = SAMPLE_PRODUCTS_DATA;
  const products: ProductItem[] = [];
  let itemCounter = 0;
  let cycle = 1;

  while (true) {
    for (let i = 0; i < baseItems.length; i++) {
      const base = baseItems[i];
      const suffix = cycle === 1 ? '' : ` #${cycle}`;
      const compSuffix = cycle === 1 ? '' : ` [Batch ${cycle}]`;

      products.push({
        id: `scale-${itemCounter}`,
        productName: `${base.productName}${suffix}`,
        pack: base.pack,
        mrp: base.mrp,
        ptr: base.ptr,
        scheme: base.scheme,
        dosageForm: resolveDosageForm(
          base.dosageForm,
          base.productName,
          base.pack,
          base.composition
        ),
        composition: `${base.composition}${compSuffix}`,
        originalRowIndex: itemCounter + 2,
      });
      itemCounter++;
    }

    const testGrouped = groupProducts(products);
    const testPages = paginateCatalogue(testGrouped, 4);
    if (testPages.length >= targetPages) {
      return {
        products,
        groupedDosageForms: testGrouped,
        totalProducts: products.length,
      };
    }
    cycle++;
  }
}

