import type { ParsedRoute, SiteConfig, RouteContext } from './types';

export function parseRoute(
  site: SiteConfig,
  slug: string[],
  ctx: RouteContext
): ParsedRoute | null {
  if (slug.length === 0) {
    return { type: 'home' };
  }

  const [first, ...rest] = slug;

  // Directory routes: first segment is base_path
  if (first === site.basePath) {
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
  const basePath = site.basePath;

  // /[base_path]
  if (segments.length === 0) {
    return { type: 'directory-base', basePath };
  }

  const [first, second, third] = segments;

  // 1 segment: category OR city
  if (segments.length === 1) {
    if (ctx.categories.has(first)) {
      return { type: 'directory-category', basePath, category: first };
    }
    if (ctx.cities.has(first)) {
      return { type: 'directory-city', basePath, city: first };
    }
    return null;
  }

  // 2 segments: category + city
  if (segments.length === 2) {
    if (ctx.categories.has(first) && ctx.cities.has(second)) {
      return {
        type: 'directory-category-city',
        basePath,
        category: first,
        city: second,
      };
    }
    return null;
  }

  // 3 segments: category + city + business_id
  if (segments.length === 3) {
    if (ctx.categories.has(first) && ctx.cities.has(second)) {
      return {
        type: 'directory-business',
        basePath,
        category: first,
        city: second,
        businessId: third,
      };
    }
    return null;
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
