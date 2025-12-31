import type { ParsedRoute } from './types';
import type { SiteConfig, RouteContext } from '@/lib/types';

export function parseRoute(
  site: SiteConfig,
  slug: string[],
  ctx: RouteContext
): ParsedRoute | null {
  if (slug.length === 0) {
    return { type: 'home' };
  }

  const [first, ...rest] = slug;

  const basePath = site.vertical?.slug ?? '';

  // Directory routes: first segment is base_path
  if (first === basePath) {
    return parseDirectoryRoute(site, rest, ctx);
  }

  // Content routes: first segment is category (without base_path prefix)
  if (ctx.categories.has(first)) {
    return parseContentRoute(first, rest);
  }

  return null;
}

function parseDirectoryRoute(
  site: SiteConfig,
  segments: string[],
  ctx: RouteContext
): ParsedRoute | null {
  const basePath = site.vertical?.slug ?? '';
  const singleCity = ctx.cityList.length === 1;
  const singleCategory = ctx.categoryList.length === 1;

  // /[base_path]
  if (segments.length === 0) {
    return { type: 'directory-base', basePath };
  }

  // Parse segments to extract category, city, businessId
  let category: string | null = null;
  let city: string | null = null;
  let businessId: string | null = null;

  const [first, second, third, fourth] = segments;

  // First segment: must be category or city
  const firstIsCategory = ctx.categories.has(first);
  const firstIsCity = ctx.cities.has(first);

  if (firstIsCategory) {
    category = first;
  } else if (firstIsCity) {
    city = first;
  } else {
    return null; // Invalid first segment
  }

  // Second segment (if exists)
  if (second !== undefined) {
    const secondIsCategory = ctx.categories.has(second);
    const secondIsCity = ctx.cities.has(second);

    if (category && secondIsCity) {
      city = second;
    } else if (city && secondIsCategory) {
      category = second;
    } else if (category && singleCity) {
      // Single-city site: second segment is business ID
      businessId = second;
    } else if (city && singleCategory) {
      // Single-category site: second segment is business ID
      businessId = second;
    } else {
      return null; // Invalid second segment
    }
  }

  // Third segment (if exists)
  if (third !== undefined) {
    if (businessId) {
      return null; // Already have business ID, too many segments
    }
    businessId = third;
  }

  // Fourth segment - too many
  if (fourth !== undefined) {
    return null;
  }

  // Apply single-city/single-category inference for missing values
  if (singleCity && !city) {
    city = ctx.cityList[0].slug;
  }
  if (singleCategory && !category) {
    category = ctx.categoryList[0].slug;
  }

  // Determine route type
  if (businessId) {
    if (!category || !city) return null;
    return { type: 'directory-business', basePath, category, city, businessId };
  }

  if (category && city) {
    return { type: 'directory-category-city', basePath, category, city };
  }

  if (category) {
    return { type: 'directory-category', basePath, category };
  }

  if (city) {
    return { type: 'directory-city', basePath, city };
  }

  return null;
}

function parseContentRoute(
  category: string,
  segments: string[]
): ParsedRoute | null {
  // /[category]
  if (segments.length === 0) {
    return { type: 'content-category', category };
  }

  // /[category]/[article_slug]
  if (segments.length === 1) {
    return { type: 'content-article', category, articleSlug: segments[0] };
  }

  return null;
}
