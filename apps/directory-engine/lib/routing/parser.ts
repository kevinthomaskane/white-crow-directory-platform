import type { ParsedRoute, SiteConfig, RouteContext } from './types';

export async function parseRoute(
  site: SiteConfig,
  slug: string[],
  ctx: RouteContext
): Promise<ParsedRoute | null> {
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

async function parseDirectoryRoute(
  site: SiteConfig,
  segments: string[],
  ctx: RouteContext
): Promise<ParsedRoute | null> {
  const basePath = site.basePath;

  // /[base_path]
  if (segments.length === 0) {
    return { type: 'directory-base', basePath };
  }

  const [first, second, third, fourth] = segments;

  // 1 segment: category OR state
  if (segments.length === 1) {
    if (ctx.categories.has(first)) {
      return { type: 'directory-category', basePath, category: first };
    }
    if (ctx.stateCodes.has(first.toLowerCase())) {
      return { type: 'directory-state', basePath, state: first };
    }
    return null;
  }

  // 2 segments: category+state OR city+state
  if (segments.length === 2) {
    const stateCode = second.toLowerCase();

    if (ctx.categories.has(first) && ctx.stateCodes.has(stateCode)) {
      return { type: 'directory-category-state', basePath, category: first, state: second };
    }

    if (ctx.stateCodes.has(stateCode)) {
      const citySlugs = await ctx.getCitySlugs(stateCode);
      if (citySlugs.has(first)) {
        return { type: 'directory-city', basePath, city: first, state: second };
      }
    }

    return null;
  }

  // 3 segments: category+city+state
  if (segments.length === 3) {
    const stateCode = third.toLowerCase();

    if (ctx.categories.has(first) && ctx.stateCodes.has(stateCode)) {
      const citySlugs = await ctx.getCitySlugs(stateCode);
      if (citySlugs.has(second)) {
        return { type: 'directory-category-city', basePath, category: first, city: second, state: third };
      }
    }

    return null;
  }

  // 4 segments: category+city+state+business_id
  if (segments.length === 4) {
    const stateCode = third.toLowerCase();

    if (ctx.categories.has(first) && ctx.stateCodes.has(stateCode)) {
      const citySlugs = await ctx.getCitySlugs(stateCode);
      if (citySlugs.has(second)) {
        return {
          type: 'directory-business',
          basePath,
          category: first,
          city: second,
          state: third,
          businessId: fourth
        };
      }
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
