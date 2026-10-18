import React from 'react';
import { ProductItem, CardTheme } from '../types';

interface ProductCardProps {
  product: ProductItem;
  theme?: CardTheme;
  index?: number;
  columns?: 3 | 4 | 5;
}

// 7 Curated Print-Safe Vibrant Colors
// Green -> Blue -> Purple -> Yellow -> Orange -> Pink -> Cyan
const PRINT_SAFE_PALETTE = [
  // 1. GREEN
  {
    name: 'Green',
    bg: '#A8E063',
    border: '#82C437',
    divider: '#95D44F',
  },
  // 2. BLUE
  {
    name: 'Blue',
    bg: '#64B5F6',
    border: '#42A5F5',
    divider: '#55A6E8',
  },
  // 3. PURPLE
  {
    name: 'Purple',
    bg: '#CE93D8',
    border: '#BA68C8',
    divider: '#C183CB',
  },
  // 4. YELLOW
  {
    name: 'Yellow',
    bg: '#FFD54F',
    border: '#FFCA28',
    divider: '#F0C43B',
  },
  // 5. ORANGE
  {
    name: 'Orange',
    bg: '#FFB74D',
    border: '#FFA726',
    divider: '#F0A536',
  },
  // 6. PINK
  {
    name: 'Pink',
    bg: '#F48FB1',
    border: '#F06292',
    divider: '#E57D9F',
  },
  // 7. CYAN
  {
    name: 'Cyan',
    bg: '#4DD0E1',
    border: '#26C6DA',
    divider: '#3EC1D2',
  },
];

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  theme = 'pastel',
  index = 0,
  columns = 4,
}) => {
  // Cycle consistently through the 7 curated print colors:
  // Green -> Blue -> Purple -> Yellow -> Orange -> Pink -> Cyan -> Green -> ...
  let cardColors = PRINT_SAFE_PALETTE[Math.abs(index) % PRINT_SAFE_PALETTE.length];

  if (theme === 'clinical') {
    cardColors = {
      name: 'Clinical',
      bg: '#F1F5F9',
      border: '#CBD5E1',
      divider: '#CBD5E1',
    };
  } else if (theme === 'ocean') {
    cardColors = {
      name: 'Ocean',
      bg: '#E0F2FE',
      border: '#7DD3FC',
      divider: '#7DD3FC',
    };
  } else if (theme === 'emerald') {
    cardColors = {
      name: 'Emerald',
      bg: '#E8F5E9',
      border: '#A5D6A7',
      divider: '#A5D6A7',
    };
  } else if (theme === 'monochrome') {
    cardColors = {
      name: 'Monochrome',
      bg: '#F5F5F5',
      border: '#D4D4D4',
      divider: '#D4D4D4',
    };
  }

  // Responsive font sizes tailored to columns (ensures comfortable readability on A4 print)
  const nameFontSize = columns === 5 ? '12px' : columns === 4 ? '13px' : '14.5px';
  const nameLineHeight = columns === 5 ? '16px' : columns === 4 ? '17px' : '19px';

  const packFontSize = columns === 5 ? '10px' : columns === 4 ? '11px' : '12px';
  const packLineHeight = columns === 5 ? '14px' : columns === 4 ? '15px' : '16px';

  const priceLabelSize = columns === 5 ? '9px' : columns === 4 ? '10px' : '11px';
  const priceValSize = columns === 5 ? '11px' : columns === 4 ? '12px' : '13.5px';
  const priceValLineHeight = columns === 5 ? '15px' : columns === 4 ? '16px' : '18px';

  const schemeLabelSize = columns === 5 ? '9px' : columns === 4 ? '10px' : '11px';
  const schemeValSize = columns === 5 ? '10.5px' : columns === 4 ? '11.5px' : '13px';

  const formatDisplayPrice = (val: string) => {
    if (!val || val === '—') return '—';
    let str = String(val).trim();
    if (str.startsWith('₹')) {
      str = str.substring(1).trim();
    }
    if (/^Rs\.?\s*/i.test(str)) {
      str = str.replace(/^Rs\.?\s*/i, '').trim();
    }
    return str ? `Rs. ${str}` : '—';
  };

  return (
    <div
      className="product-card flex flex-col justify-between"
      style={{
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
        backgroundColor: cardColors.bg,
        border: `1.5px solid ${cardColors.border}`,
        borderRadius: '12px',
        padding: '12px 10px 10px 10px',
        boxSizing: 'border-box',
        minHeight: '138px',
        height: 'auto',
        overflow: 'visible',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      {/* 1. Header: Product Name & Pack (Prominent & Centered) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          overflow: 'visible',
          marginBottom: '8px',
        }}
      >
        {/* Product Name Area: Dedicated container with vertical & horizontal centering */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '38px',
            width: '100%',
            overflow: 'visible',
            marginBottom: '3px',
          }}
        >
          <h4
            style={{
              display: 'block',
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: nameFontSize,
              lineHeight: nameLineHeight,
              fontWeight: 900,
              color: '#111111',
              margin: 0,
              padding: 0,
              textAlign: 'center',
              overflow: 'visible',
              wordBreak: 'break-word',
              letterSpacing: '-0.01em',
              width: '100%',
            }}
            title={product.productName}
          >
            {product.productName}
          </h4>
        </div>

        {/* Pack Size (Directly below Product Name, vertically centered) */}
        {product.pack && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              minHeight: '16px',
              overflow: 'visible',
            }}
          >
            <p
              style={{
                display: 'block',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: packFontSize,
                lineHeight: packLineHeight,
                fontWeight: 700,
                color: '#263238',
                textTransform: 'uppercase',
                margin: 0,
                padding: 0,
                textAlign: 'center',
                overflow: 'visible',
                wordBreak: 'break-word',
                letterSpacing: '0.02em',
                width: '100%',
              }}
              title={product.pack}
            >
              {product.pack}
            </p>
          </div>
        )}
      </div>

      {/* 2. Bottom Commercial Section: Pricing & Scheme */}
      <div
        style={{
          display: 'block',
          width: '100%',
          marginTop: 'auto',
          overflow: 'visible',
        }}
      >
        {/* Clean Divider Line */}
        <div
          style={{
            height: '1px',
            backgroundColor: cardColors.divider,
            margin: '0 0 7px 0',
            width: '100%',
          }}
        />

        {/* Price Area: Simple Two-Column Layout (MRP on Left, PTR on Right) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            margin: '0 0 6px 0',
            width: '100%',
            overflow: 'visible',
          }}
        >
          {/* Left Column: MRP */}
          <div style={{ flex: 1, textAlign: 'left', minWidth: 0, paddingRight: '4px' }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: priceLabelSize,
                lineHeight: '12px',
                fontWeight: 700,
                color: '#37474F',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                marginBottom: '1px',
              }}
            >
              MRP
            </span>
            <span
              style={{
                display: 'block',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: priceValSize,
                lineHeight: priceValLineHeight,
                fontWeight: 900,
                color: '#111111',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {formatDisplayPrice(product.mrp)}
            </span>
          </div>

          {/* Right Column: PTR */}
          <div style={{ flex: 1, textAlign: 'right', minWidth: 0, paddingLeft: '4px' }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: priceLabelSize,
                lineHeight: '12px',
                fontWeight: 700,
                color: '#37474F',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                marginBottom: '1px',
              }}
            >
              PTR
            </span>
            <span
              style={{
                display: 'block',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: priceValSize,
                lineHeight: priceValLineHeight,
                fontWeight: 900,
                color: '#111111',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {formatDisplayPrice(product.ptr)}
            </span>
          </div>
        </div>

        {/* Scheme Area: Simple Text Row (No Badge, No Pill, Vertically Centered) */}
        {product.scheme && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '5px',
              borderTop: `1px dashed ${cardColors.divider}`,
              width: '100%',
              minHeight: '18px',
              overflow: 'visible',
            }}
          >
            <span
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: schemeLabelSize,
                lineHeight: 1,
                fontWeight: 700,
                color: '#37474F',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                marginRight: '6px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              SCHEME
            </span>
            <span
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: schemeValSize,
                lineHeight: 1,
                fontWeight: 800,
                color: '#111111',
                textAlign: 'right',
                wordBreak: 'break-word',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {product.scheme}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
