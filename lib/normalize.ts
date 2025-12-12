export function normalizeWhitespace(input: string) {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Produces a stable slug for categories/verticals.
 * - lowercases
 * - removes diacritics
 * - turns "&" into "and"
 * - replaces non-alphanumerics with "-"
 */
export function slugify(input: string) {
  const base = normalizeWhitespace(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

  return base
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Normalizes category display names for consistency.
 * - trims / collapses whitespace
 * - normalizes quotes/dashes
 * - title-cases most words but keeps common acronyms uppercase
 */
export function normalizeCategoryName(input: string) {
  const cleaned = normalizeWhitespace(input)
    .replace(/[’]/g, "'")
    .replace(/[–—]/g, '-');

  const words = cleaned.split(' ');
  const titled = words.map((word) => {
    const raw = word.replace(/[^a-zA-Z0-9.]/g, '');
    // Keep short all-caps acronyms like DUI, IRS, LLC
    if (raw.length > 1 && raw.length <= 5 && raw === raw.toUpperCase()) {
      return word;
    }
    // Keep dotted acronyms like U.S., D.C.
    if (raw.includes('.') && raw === raw.toUpperCase()) {
      return word;
    }
    const lower = word.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });

  return titled.join(' ');
}
