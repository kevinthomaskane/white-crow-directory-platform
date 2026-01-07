import { cache } from 'react';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import type {
  SiteConfig,
  RouteContext,
  CategoryData,
  CityData,
  PopularCityData,
  SiteStats,
} from '@/lib/types';

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
      vertical_id,
      state_id,
      hero_path,
      logo_path,
      favicon_path,
      vertical:verticals(slug, term_category, term_categories, term_business, term_businesses, term_cta),
      state:states(code)
    `
    )
    .eq('domain', domain.toLowerCase())
    .single();

  if (!site) return null;

  const siteConfig: SiteConfig = {
    id: site.id,
    name: site.name,
    vertical_id: site.vertical_id,
    state_id: site.state_id,
    hero_path: site.hero_path,
    logo_path: site.logo_path,
    favicon_path: site.favicon_path,
    vertical: site.vertical,
    state: site.state,
  };

  return siteConfig;
});

export const getRouteContext = cache(
  async (site: SiteConfig): Promise<RouteContext> => {
    const supabase = await createClient();

    const { data: siteCategories } = await supabase
      .from('site_categories')
      .select('category:categories(slug, name)')
      .eq('site_id', site.id);

    const { data: siteCities } = await supabase
      .from('site_cities')
      .select('city:cities(name)')
      .eq('site_id', site.id);

    const categoryList: CategoryData[] = (siteCategories || [])
      .map((sc) => {
        const cat = sc.category as { slug: string; name: string } | null;
        return cat ? { slug: cat.slug, name: cat.name } : null;
      })
      .filter((c): c is CategoryData => c !== null);

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

export const getSiteStats = cache(
  async (site: SiteConfig, ctx: RouteContext): Promise<SiteStats> => {
    const supabase = await createClient();

    const { count } = await supabase
      .from('site_businesses')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', site.id);

    return {
      businessCount: count ?? 0,
      categoryCount: ctx.categoryList.length,
      cityCount: ctx.cityList.length,
    };
  }
);

export const getPopularCities = cache(
  async (siteId: string, limit = 30): Promise<PopularCityData[]> => {
    const supabase = await createClient();

    const { data } = await supabase
      .from('site_cities')
      .select('city:cities(name, population)')
      .eq('site_id', siteId)
      .order('city(population)', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (!data) return [];

    return data
      .map((sc) => {
        const city = sc.city;
        return city
          ? {
              slug: slugify(city.name),
              name: city.name,
              population: city.population,
            }
          : null;
      })
      .filter((c) => c !== null);
  }
);
