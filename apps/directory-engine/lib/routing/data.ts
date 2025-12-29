import { cache } from 'react';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import type { SiteConfig, RouteContext, CategoryData, CityData } from './types';

export const getSiteConfig = cache(async (): Promise<SiteConfig | null> => {
  const headersList = await headers();
  const domain = headersList.get('x-site');

  if (!domain) return null;

  const supabase = await createClient();

  const { data: site } = await supabase
    .from('sites')
    .select(
      `
      id,
      name,
      domain,
      vertical_id,
      state_id,
      vertical:verticals(slug),
      state:states(code)
    `
    )
    .eq('domain', domain.toLowerCase())
    .single();

  if (!site) return null;

  return {
    id: site.id,
    name: site.name,
    basePath: (site.vertical as { slug: string })?.slug || '',
    verticalId: site.vertical_id,
    stateId: site.state_id,
    stateCode: (site.state as { code: string })?.code || '',
  };
});

export const getRouteContext = cache(
  async (site: SiteConfig): Promise<RouteContext> => {
    const supabase = await createClient();

    // Get categories enabled for this site
    const { data: siteCategories } = await supabase
      .from('site_categories')
      .select('category:categories(slug, name)')
      .eq('site_id', site.id);

    // Get cities enabled for this site
    const { data: siteCities } = await supabase
      .from('site_cities')
      .select('city:cities(name)')
      .eq('site_id', site.id);

    // Build category list and set
    const categoryList: CategoryData[] = (siteCategories || [])
      .map((sc) => {
        const cat = sc.category as { slug: string; name: string } | null;
        return cat ? { slug: cat.slug, name: cat.name } : null;
      })
      .filter((c): c is CategoryData => c !== null);

    // Build city list and set (slugify city names)
    const cityList: CityData[] = (siteCities || [])
      .map((sc) => {
        const city = sc.city as { name: string } | null;
        return city ? { slug: slugify(city.name), name: city.name } : null;
      })
      .filter((c): c is CityData => c !== null);

    return {
      categoryList,
      cityList,
      categories: new Set(categoryList.map((c) => c.slug)),
      cities: new Set(cityList.map((c) => c.slug)),
    };
  }
);
