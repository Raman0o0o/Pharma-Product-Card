/**
 * Utility to normalize modern CSS colors (oklch, oklab, color(), color-mix())
 * into browser-computed sRGB / RGB / RGBA / HEX for PDF canvas renderers like html2canvas.
 */

// Cache of resolved color strings to avoid redundant rasterization
const colorCache = new Map<string, string>();

let canvasRef: HTMLCanvasElement | null = null;
let ctxRef: CanvasRenderingContext2D | null = null;

function getCanvasContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!canvasRef) {
    try {
      canvasRef = document.createElement('canvas');
      canvasRef.width = 1;
      canvasRef.height = 1;
      ctxRef = canvasRef.getContext('2d', { willReadFrequently: true });
    } catch {
      ctxRef = null;
    }
  }
  return ctxRef;
}

/**
 * Analytical conversion from OKLCH parameters to standard sRGB string
 */
function oklchToRgb(L: number, C: number, H: number, alpha: number = 1): string {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m_ = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s_ = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);

  const rLin = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const gLin = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bLin = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

  function gamma(c: number): number {
    const clamped = Math.max(0, Math.min(1, c));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  }

  const R = Math.round(gamma(rLin) * 255);
  const G = Math.round(gamma(gLin) * 255);
  const B = Math.round(gamma(bLin) * 255);

  if (alpha < 1) {
    return `rgba(${R}, ${G}, ${B}, ${Math.round(alpha * 1000) / 1000})`;
  }
  return `rgb(${R}, ${G}, ${B})`;
}

/**
 * Parses an OKLCH CSS string and converts it directly to sRGB
 */
function parseOklch(str: string): string | null {
  const match = str.match(
    /oklch\s*\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+(?:deg|rad|turn)?)(?:\s*\/\s*([\d.]+%?))?\s*\)/i
  );
  if (!match) return null;
  const [, lStr, cStr, hStr, aStr] = match;

  const L = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
  const C = cStr.endsWith('%') ? (parseFloat(cStr) / 100) * 0.4 : parseFloat(cStr);
  let H = parseFloat(hStr);
  if (hStr.endsWith('rad')) H = (H * 180) / Math.PI;
  if (hStr.endsWith('turn')) H = H * 360;

  let alpha = 1;
  if (aStr) {
    alpha = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
  }

  return oklchToRgb(L, C, H, alpha);
}

/**
 * Parses an OKLAB CSS string and converts it directly to sRGB
 */
function parseOklab(str: string): string | null {
  const match = str.match(
    /oklab\s*\(\s*([\d.]+%?)\s+([-\d.]+%?)\s+([-\d.]+%?)(?:\s*\/\s*([\d.]+%?))?\s*\)/i
  );
  if (!match) return null;
  const [, lStr, aStr, bStr, alphaStr] = match;

  const L = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
  const a = aStr.endsWith('%') ? (parseFloat(aStr) / 100) * 0.4 : parseFloat(aStr);
  const b = bStr.endsWith('%') ? (parseFloat(bStr) / 100) * 0.4 : parseFloat(bStr);

  const C = Math.sqrt(a * a + b * b);
  const H = (Math.atan2(b, a) * 180) / Math.PI;
  const positiveH = H < 0 ? H + 360 : H;

  let alpha = 1;
  if (alphaStr) {
    alpha = alphaStr.endsWith('%')
      ? parseFloat(alphaStr) / 100
      : parseFloat(alphaStr);
  }

  return oklchToRgb(L, C, positiveH, alpha);
}

/**
 * Resolves any modern CSS color string (oklch, oklab, color-mix, color())
 * to a standard rgb(...) or rgba(...) string using browser canvas or mathematical fallback.
 */
export function resolveModernColorToRgb(colorStr: string): string {
  if (!colorStr) return colorStr;
  const trimmed = colorStr.trim();
  if (!trimmed) return trimmed;

  if (colorCache.has(trimmed)) {
    return colorCache.get(trimmed)!;
  }

  // Fast path: standard colors without modern functions
  if (
    !trimmed.includes('oklch') &&
    !trimmed.includes('oklab') &&
    !trimmed.includes('color-mix') &&
    !trimmed.includes('color(')
  ) {
    colorCache.set(trimmed, trimmed);
    return trimmed;
  }

  // 1. Try mathematical OKLCH parser
  if (trimmed.startsWith('oklch')) {
    const oklchResult = parseOklch(trimmed);
    if (oklchResult) {
      colorCache.set(trimmed, oklchResult);
      return oklchResult;
    }
  }

  // 2. Try mathematical OKLAB parser
  if (trimmed.startsWith('oklab')) {
    const oklabResult = parseOklab(trimmed);
    if (oklabResult) {
      colorCache.set(trimmed, oklabResult);
      return oklabResult;
    }
  }

  // 3. Browser Canvas rasterizer
  const ctx = getCanvasContext();
  if (ctx) {
    try {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000000';
      ctx.fillStyle = trimmed;

      const computed = ctx.fillStyle;
      if (
        computed &&
        !computed.includes('oklch') &&
        !computed.includes('oklab') &&
        !computed.includes('color(')
      ) {
        colorCache.set(trimmed, computed);
        return computed;
      }

      ctx.fillRect(0, 0, 1, 1);
      const pixel = ctx.getImageData(0, 0, 1, 1).data;
      const [r, g, b, a] = pixel;
      const alpha = a / 255;

      const resolved =
        alpha === 1
          ? `rgb(${r}, ${g}, ${b})`
          : `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;

      colorCache.set(trimmed, resolved);
      return resolved;
    } catch {
      // Continue to safe fallback
    }
  }

  // Fallback to neutral black
  return '#000000';
}

/**
 * Replaces modern color functions (oklch, oklab, color, color-mix) in complex CSS values
 * (such as box-shadow, borders, linear-gradient, or stylesheet declarations).
 */
export function replaceModernColorFunctions(cssText: string): string {
  if (!cssText) return cssText;
  if (
    !cssText.includes('oklch') &&
    !cssText.includes('oklab') &&
    !cssText.includes('color-mix') &&
    !cssText.includes('color(')
  ) {
    return cssText;
  }

  // Matches modern functional color notations with balanced inner parentheses
  const regex = /\b(oklch|oklab|color-mix|color)\s*\((?:[^()]+|\([^()]*\))*\)/gi;

  return cssText.replace(regex, (match) => {
    return resolveModernColorToRgb(match);
  });
}

/**
 * Inspects all elements in a DOM tree and converts any computed or inline colors
 * from unsupported color functions (oklch, etc.) into standard RGB/RGBA.
 */
export function normalizeElementColorsForPdf(rootElement: HTMLElement): void {
  if (!rootElement || typeof window === 'undefined') return;

  const elements = [
    rootElement,
    ...Array.from(rootElement.querySelectorAll('*')),
  ] as HTMLElement[];

  const colorProperties = [
    'color',
    'backgroundColor',
    'borderColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'outlineColor',
    'boxShadow',
    'textShadow',
    'textDecorationColor',
  ] as const;

  for (const el of elements) {
    // 1. Sanitize inline style attribute
    const inlineStyle = el.getAttribute('style');
    if (inlineStyle && /(oklch|oklab|color\(|color-mix)/i.test(inlineStyle)) {
      el.setAttribute('style', replaceModernColorFunctions(inlineStyle));
    }

    // 2. Inspect computed styles
    try {
      const computed = window.getComputedStyle(el);
      for (const prop of colorProperties) {
        const val = computed[prop];
        if (val && /(oklch|oklab|color\(|color-mix)/i.test(val)) {
          const resolved = replaceModernColorFunctions(val);
          (el.style as any)[prop] = resolved;
        }
      }
    } catch {
      // Continue safely if an individual element computed style is inaccessible
    }
  }
}

/**
 * Prepares and sanitizes the cloned document created by html2canvas before rasterization.
 * 1. Sanitizes all stylesheets in <head> to eliminate oklch/oklab rules.
 * 2. Normalizes all element colors in the target element.
 * 3. Cleans up unnecessary DOM nodes to speed up canvas capture.
 */
export function sanitizeClonedDocForPdf(
  clonedDoc: Document,
  clonedElement: HTMLElement
): void {
  if (!clonedDoc) return;

  // 1. Sanitize all <style> elements in the cloned document
  const styleElements = clonedDoc.querySelectorAll('style');
  styleElements.forEach((styleTag) => {
    if (
      styleTag.textContent &&
      /(oklch|oklab|color\(|color-mix)/i.test(styleTag.textContent)
    ) {
      styleTag.textContent = replaceModernColorFunctions(styleTag.textContent);
    }
  });

  // 2. Normalize all elements in the cloned page
  if (clonedElement) {
    normalizeElementColorsForPdf(clonedElement);
  }

  // 3. Clear extraneous body elements in the clone to isolate the target page
  if (clonedDoc.body && clonedElement) {
    const directChildren = Array.from(clonedDoc.body.children);
    for (const child of directChildren) {
      if (!child.contains(clonedElement) && child !== clonedElement) {
        try {
          clonedDoc.body.removeChild(child);
        } catch {
          // Ignore removal errors
        }
      }
    }
  }
}
