'use server';

import { getSiteConfig, getBusinessesByCategoryAndCity } from '@/lib/data/site';
import type { ActionsResponse, BusinessCardData } from '@/lib/types';

export interface CategoryCityBusinessesData {
  businesses: BusinessCardData[];
  total: number;
  hasMore: boolean;
}

export async function fetchCategoryCityBusinesses(
  categorySlug: string,
  citySlug: string,
  page: number,
  limit: number
): Promise<ActionsResponse<CategoryCityBusinessesData>> {
  const site = await getSiteConfig();
  if (!site) {
    return { ok: false, error: 'Site not found' };
  }

  try {
    const result = await getBusinessesByCategoryAndCity(
      site.id,
      categorySlug,
      citySlug,
      page,
      limit
    );
    return { ok: true, data: result };
  } catch (error) {
    console.error('Failed to fetch category city businesses:', error);
    return { ok: false, error: 'Failed to fetch businesses' };
  }
}
