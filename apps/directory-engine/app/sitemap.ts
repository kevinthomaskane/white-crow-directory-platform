import type { MetadataRoute } from 'next';
import { createServiceRoleClient } from '@white-crow/shared';
import { getSiteConfig, getRouteContext } from '@/lib/data/site';
import { buildDirectoryUrl, slugify } from '@/lib/utils';

interface SitemapBusiness {
  id: string;
  city: string | null;
  categorySlug: string | null;
}

const BATCH_SIZE = 1000;

async function getAllSiteBusinesses(
  siteId: string
): Promise<SitemapBusiness[]> {
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const allBusinesses: SitemapBusiness[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data } = await supabase
      .from('site_businesses')
      .select(
        `
        business:businesses!inner(
          id,
          city,
          business_categories(category:categories(slug))
        )
      `
      )
      .eq('site_id', siteId)
      .range(offset, offset + BATCH_SIZE - 1);

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    const businesses = data
      .map((sb): SitemapBusiness | null => {
        const business = sb.business;
        if (!business) return null;

        const categorySlug: string | null =
          business.business_categories?.[0]?.category?.slug ?? null;

        return {
          id: business.id,
          city: business.city,
          categorySlug,
        };
      })
      .filter((b): b is SitemapBusiness => b !== null);

    allBusinesses.push(...businesses);

    if (data.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      offset += BATCH_SIZE;
    }
  }

  return allBusinesses;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteConfig();
  if (!site) return [];

  const ctx = await getRouteContext(site);
  const baseUrl = `https://${site.domain}`;
  const basePath = site.vertical?.slug ?? '';

  const singleCity = ctx.cityList.length === 1;
  const singleCategory = ctx.categoryList.length === 1;

  const urls: MetadataRoute.Sitemap = [];

  // Homepage
  urls.push({
    url: baseUrl,
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // Directory base page
  const directoryUrl = buildDirectoryUrl({
    basePath,
    singleCity,
    singleCategory,
  });
  if (directoryUrl !== '/') {
    urls.push({
      url: `${baseUrl}${directoryUrl}`,
      changeFrequency: 'daily',
      priority: 0.9,
    });
  }

  // Category pages (only if multiple categories)
  if (!singleCategory) {
    for (const category of ctx.categoryList) {
      const categoryUrl = buildDirectoryUrl({
        basePath,
        categorySlug: category.slug,
        singleCity,
        singleCategory,
      });
      urls.push({
        url: `${baseUrl}${categoryUrl}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // City pages (only if multiple cities)
  if (!singleCity) {
    for (const city of ctx.cityList) {
      const cityUrl = buildDirectoryUrl({
        basePath,
        citySlug: city.slug,
        singleCity,
        singleCategory,
      });
      urls.push({
        url: `${baseUrl}${cityUrl}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // Category + City pages (only if both multiple)
  if (!singleCategory && !singleCity) {
    for (const category of ctx.categoryList) {
      for (const city of ctx.cityList) {
        const categoryCityUrl = buildDirectoryUrl({
          basePath,
          categorySlug: category.slug,
          citySlug: city.slug,
          singleCity,
          singleCategory,
        });
        urls.push({
          url: `${baseUrl}${categoryCityUrl}`,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  }

  // Business detail pages
  const businesses = await getAllSiteBusinesses(site.id);
  for (const business of businesses) {
    const citySlug = business.city ? slugify(business.city) : null;
    const businessUrl = buildDirectoryUrl({
      basePath,
      categorySlug: business.categorySlug,
      citySlug,
      businessId: business.id,
      singleCity,
      singleCategory,
    });
    urls.push({
      url: `${baseUrl}${businessUrl}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  return urls;
}
