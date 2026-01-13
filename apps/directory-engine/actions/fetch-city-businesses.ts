'use server';

import { getSiteConfig, getBusinessesByCity } from '@/lib/data/site';
import type { ActionsResponse, BusinessCardData } from '@/lib/types';

export interface CityBusinessesData {
  businesses: BusinessCardData[];
  total: number;
  hasMore: boolean;
}

export async function fetchCityBusinesses(
  citySlug: string,
  page: number,
  limit: number
): Promise<ActionsResponse<CityBusinessesData>> {
  const site = await getSiteConfig();
  if (!site) {
    return { ok: false, error: 'Site not found' };
  }

  try {
    const result = await getBusinessesByCity(site.id, citySlug, page, limit);
    return { ok: true, data: result };
  } catch (error) {
    console.error('Failed to fetch city businesses:', error);
    return { ok: false, error: 'Failed to fetch businesses' };
  }
}
