'use server';

import { getSiteConfig, getBusinessesInBounds } from '@/lib/data/site';
import type { MapBusinessData, MapBounds } from '@/lib/types';

export async function fetchMapBusinesses(
  bounds: MapBounds,
  excludeIds: string[] = []
): Promise<MapBusinessData[]> {
  const site = await getSiteConfig();
  if (!site) {
    return [];
  }

  try {
    return await getBusinessesInBounds(site.id, bounds, 200, excludeIds);
  } catch (error) {
    console.error('Failed to fetch map businesses:', error);
    return [];
  }
}
