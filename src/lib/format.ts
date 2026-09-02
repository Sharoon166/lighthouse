const cachedFormatters = new Map<string, Intl.NumberFormat>();

function getFormatter(
  locale: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${locale}::${JSON.stringify(options)}`;
  let formatter = cachedFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    cachedFormatters.set(key, formatter);
  }
  return formatter;
}

export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  /** Show currency symbol/code (default: true) */
  showCurrency?: boolean;
  /** Use compact notation for large numbers (default: false) */
  compact?: boolean;
  /** Minimum fraction digits (default: 0) */
  minimumFractionDigits?: number;
  /** Maximum fraction digits (default: 2) */
  maximumFractionDigits?: number;
}

const DEFAULT_CURRENCY = "PKR";
const DEFAULT_LOCALE = "en-PK";

/**
 * Format a number as currency.
 *
 * @example
 * formatCurrency(1299)            // "Rs. 1,299"
 * formatCurrency(1299.50)         // "Rs. 1,299.50"
 * formatCurrency(1299, { currency: "USD", locale: "en-US" }) // "$1,299"
 * formatCurrency(15000, { compact: true }) // "Rs. 15K"
 * formatCurrency(0, { showCurrency: false }) // "0"
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {},
): string {
  const {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    showCurrency = true,
    compact = false,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  if (!showCurrency) {
    const formatter = getFormatter(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      notation: compact ? "compact" : "standard",
      compactDisplay: "short",
    });
    return formatter.format(amount);
  }

  const formatter = getFormatter(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? "compact" : "standard",
    compactDisplay: "short",
  });

  return formatter.format(amount);
}

/**
 * Format a price range (e.g., product variants).
 */
export function formatPriceRange(
  min: number,
  max: number,
  options: CurrencyFormatOptions = {},
): string {
  if (min === max) return formatCurrency(min, options);
  return `${formatCurrency(min, options)} – ${formatCurrency(max, options)}`;
}
