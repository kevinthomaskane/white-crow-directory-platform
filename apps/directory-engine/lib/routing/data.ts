import { cache } from 'react';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { SiteConfig, RouteContext } from './types';

export const getSiteConfig = cache(async (): Promise<SiteConfig | null> => {
  const headersList = await headers();
  const domain = headersList.get('x-site');

  if (!domain) return null;

  const supabase = await createClient();

  const { data: site } = await supabase
    .from('sites')
    .select(`
      id,
      name,
      domain,
      vertical_id,
      state_id,
      vertical:verticals(slug),
      state:states(code)
    `)
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

export const getRouteContext = cache(async (site: SiteConfig): Promise<RouteContext> => {
  const supabase = await createClient();

  // Get categories for this site's vertical
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .eq('vertical_id', site.verticalId);

  // Get all state codes
  const { data: states } = await supabase
    .from('states')
    .select('code');

  const categorySet = new Set(categories?.map((c) => c.slug) || []);
  const stateSet = new Set(states?.map((s) => s.code.toLowerCase()) || []);

  // City lookup function with caching
  const cityCache = new Map<string, Set<string>>();

  const getCitySlugs = async (stateCode: string): Promise<Set<string>> => {
    const cached = cityCache.get(stateCode);
    if (cached) return cached;

    const { data: state } = await supabase
      .from('states')
      .select('id')
      .eq('code', stateCode.toUpperCase())
      .single();

    if (!state) {
      const empty = new Set<string>();
      cityCache.set(stateCode, empty);
      return empty;
    }

    const { data: cities } = await supabase
      .from('cities')
      .select('slug')
      .eq('state_id', state.id);

    const citySet = new Set(cities?.map((c) => c.slug) || []);
    cityCache.set(stateCode, citySet);
    return citySet;
  };

  return {
    categories: categorySet,
    stateCodes: stateSet,
    getCitySlugs,
  };
});
