import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

/**
 * Validates that the email domain matches the business website domain
 */
export function validateEmailDomain(
  email: string,
  businessWebsite: string
): boolean {
  try {
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!emailDomain) return false;

    const websiteDomain = new URL(businessWebsite).hostname
      .replace(/^www\./, '')
      .toLowerCase();

    return emailDomain === websiteDomain;
  } catch {
    return false;
  }
}

interface BusinessImageOptions {
  /** Width for the image (default: 800) */
  width?: number;
  /** Height for the image (optional, maintains aspect ratio if omitted) */
  height?: number;
  /** Quality 1-100 for Supabase images (default: 80) */
  quality?: number;
}

/**
 * Generates the URL for a business photo.
 * Handles both Google Places photo names (places/...) and Supabase storage paths.
 *
 * For Supabase images, uses the render/image endpoint for on-the-fly transformations.
 *
 * @param photoName - The photo name or storage path
 * @param options - Transform options (width, height, quality)
 * @returns The URL to fetch the image, or null if no photo name provided
 */
export function getBusinessImageUrl(
  photoName: string | null | undefined,
  options: BusinessImageOptions = {}
): string | null {
  if (!photoName) return null;

  const { width = 800, height, quality = 80 } = options;

  // Google Places photo names start with "places/"
  if (photoName.startsWith('places/')) {
    // Google Places API uses maxHeight/maxWidth
    const maxDimension = height ?? width;
    return `/api/places-photo?name=${encodeURIComponent(photoName)}&maxHeight=${maxDimension}`;
  }

  // Supabase storage path - use render endpoint for image transformations
  const params = new URLSearchParams();
  params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('quality', quality.toString());

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/${photoName}?${params.toString()}`;
}
