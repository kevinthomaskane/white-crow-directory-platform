'use server';

import { getSiteConfig, getBusinessesByCategory } from '@/lib/data/site';
import type { ActionsResponse, BusinessCardData } from '@/lib/types';

export interface CategoryBusinessesData {
  businesses: BusinessCardData[];
  total: number;
  hasMore: boolean;
}

export async function fetchCategoryBusinesses(
  categorySlug: string,
  page: number,
  limit: number
): Promise<ActionsResponse<CategoryBusinessesData>> {
  const site = await getSiteConfig();
  if (!site) {
    return { ok: false, error: 'Site not found' };
  }

  try {
    const result = await getBusinessesByCategory(
      site.id,
      categorySlug,
      page,
      limit
    );
    return { ok: true, data: result };
  } catch (error) {
    console.error('Failed to fetch category businesses:', error);
    return { ok: false, error: 'Failed to fetch businesses' };
  }
}
